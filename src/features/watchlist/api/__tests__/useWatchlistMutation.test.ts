import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ProductListing } from "@/data/internal/product/ProductListing.ts";
import { productListingQueryKeys } from "@/data/internal/product/ProductListingQueryKeys.ts";
import { useWatchlistMutation } from "../useWatchlistMutation.ts";

const mockAdd = vi.hoisted(() => vi.fn());
const mockDelete = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn());
const mockToast = vi.hoisted(() => ({ info: vi.fn(), warning: vi.fn(), error: vi.fn() }));
const auth = vi.hoisted(() => ({ userId: "user-1" as string | undefined }));

vi.mock("@/client", () => ({ addWatchlistProduct: mockAdd, deleteWatchlistProduct: mockDelete }));
vi.mock("sonner", () => ({ toast: mockToast }));
vi.mock("@/hooks/common/useApiError.ts", () => ({
    useApiError: () => ({ getErrorMessage: mockGetErrorMessage }),
}));
vi.mock("@/data/internal/hooks/ApiError.ts", () => ({
    mapToInternalApiError: (error: unknown) => error,
}));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock("aws-amplify/auth", () => ({
    getCurrentUser: async () => {
        if (!auth.userId) throw new Error("Signed out");
        return { userId: auth.userId };
    },
}));

function makeListing(productListingId: string, watching: boolean): ProductListing {
    return {
        productListingId,
        sourceListingId: `source-${productListingId}`,
        source: { listingSourceId: "source-1", name: "Source", slugId: "source" },
        userState: {
            watchlist: { watching, notifications: true },
            contentVisibility: { showUnassessedOrSensitiveContent: false },
            notification: { unseenNotificationIds: [], hasUnseenNotification: false },
            searchFilter: { matched: false, hidden: false },
        },
    } as unknown as ProductListing;
}

type ListingPages = { pages: Array<{ products: ProductListing[] }> };

describe("useWatchlistMutation", () => {
    let queryClient: QueryClient;
    const productListingId = "listing-1";
    const context = { language: "en", currency: "EUR" } as const;
    const watchlistKey = productListingQueryKeys.watchlist({
        ...context,
        viewerCacheKey: "user-1",
    });
    const searchKey = productListingQueryKeys.search({}, context);
    const detailKey = productListingQueryKeys.detailBySlug("vase", context);
    const wrapper = ({ children }: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children);
    const watchingIn = (key: readonly unknown[], index = 0) =>
        queryClient.getQueryData<ListingPages>(key)?.pages[0].products[index].userState?.watchlist
            .watching;
    const seed = (...listings: ProductListing[]) => {
        queryClient.setQueryData(watchlistKey, {
            pages: [{ products: listings, size: listings.length }],
            pageParams: [undefined],
        });
        queryClient.setQueryData(searchKey, {
            pages: [{ products: listings, total: listings.length }],
            pageParams: [undefined],
        });
    };

    beforeEach(() => {
        vi.clearAllMocks();
        auth.userId = "user-1";
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
        });
        seed(makeListing(productListingId, false));
        mockGetErrorMessage.mockImplementation((error) => error?.message ?? "Unknown error");
    });

    it("adds by canonical listing ID and keeps the entry response out of listing caches", async () => {
        mockAdd.mockResolvedValue({
            data: { userId: "user-1", productListingId, notifications: true, state: "ACTIVE" },
            error: null,
        });
        const { result } = renderHook(() => useWatchlistMutation(productListingId), { wrapper });

        await act(() => result.current.mutateAsync("addToWatchlist"));

        expect(mockAdd).toHaveBeenCalledWith({ body: { productListingId } });
        expect(
            queryClient.getQueryData<ListingPages>(watchlistKey)?.pages[0].products[0],
        ).toMatchObject({
            productListingId,
            source: { listingSourceId: "source-1" },
            userState: { watchlist: { watching: true } },
        });
        expect(watchingIn(searchKey)).toBe(true);
    });

    it("shows the sign-in notice without a request or pending state when signed out", async () => {
        auth.userId = undefined;
        const { result } = renderHook(() => useWatchlistMutation(productListingId), { wrapper });
        await act(async () => {});

        act(() => result.current.mutate("addToWatchlist"));

        expect(mockToast.info).toHaveBeenCalledWith("watchlist.loginRequired");
        expect(mockAdd).not.toHaveBeenCalled();
        expect(result.current.isPending).toBe(false);
        expect(queryClient.isMutating()).toBe(0);
    });

    it("updates the raw detail wrapper cached for SSR", async () => {
        queryClient.setQueryData(detailKey, {
            item: { productListingId },
            userState: { ...makeListing(productListingId, false).userState },
        });
        mockAdd.mockResolvedValue({ data: {}, error: null });
        const { result } = renderHook(() => useWatchlistMutation(productListingId), { wrapper });

        await act(() => result.current.mutateAsync("addToWatchlist"));

        expect(
            queryClient.getQueryData<{ userState: { watchlist: { watching: boolean } } }>(detailKey)
                ?.userState.watchlist.watching,
        ).toBe(true);
    });

    it("removes only the watchlist row on delete and updates other listing views", async () => {
        seed(makeListing(productListingId, true));
        mockDelete.mockResolvedValue({ data: {}, error: null });
        const { result } = renderHook(() => useWatchlistMutation(productListingId), { wrapper });

        await act(() => result.current.mutateAsync("deleteFromWatchlist"));

        expect(mockDelete).toHaveBeenCalledWith({ path: { productListingId } });
        expect(queryClient.getQueryData<ListingPages>(watchlistKey)?.pages[0].products).toEqual([]);
        expect(watchingIn(searchKey)).toBe(false);
    });

    it("leaves caches untouched on a duplicate-add conflict and refreshes listing views", async () => {
        mockAdd.mockResolvedValue({
            data: null,
            error: { message: "Already on the watchlist" },
            response: { status: 409 },
        });
        const { result } = renderHook(() => useWatchlistMutation(productListingId), { wrapper });

        await act(() =>
            expect(result.current.mutateAsync("addToWatchlist")).rejects.toThrow(
                "Already on the watchlist",
            ),
        );

        expect(mockToast.warning).toHaveBeenCalled();
        expect(watchingIn(searchKey)).toBe(false);
        expect(queryClient.getQueryState(searchKey)?.isInvalidated).toBe(true);
        expect(queryClient.getQueryState(watchlistKey)?.isInvalidated).toBe(true);
    });

    it("keeps the watchlist row when deletion fails", async () => {
        seed(makeListing(productListingId, true));
        mockDelete.mockResolvedValue({
            data: null,
            error: { message: "Deletion failed" },
            response: { status: 500 },
        });
        const { result } = renderHook(() => useWatchlistMutation(productListingId), { wrapper });

        await act(() =>
            expect(result.current.mutateAsync("deleteFromWatchlist")).rejects.toThrow(
                "Deletion failed",
            ),
        );

        expect(
            queryClient.getQueryData<ListingPages>(watchlistKey)?.pages[0].products,
        ).toHaveLength(1);
        expect(watchingIn(searchKey)).toBe(true);
    });

    it("keeps another listing's confirmed change when a concurrent toggle fails", async () => {
        seed(makeListing("listing-1", false), makeListing("listing-2", false));
        let failFirst!: () => void;
        mockAdd.mockImplementation(({ body }: { body: { productListingId: string } }) =>
            body.productListingId === "listing-1"
                ? new Promise((resolve) => {
                      failFirst = () =>
                          resolve({
                              data: null,
                              error: { message: "Unavailable" },
                              response: { status: 503 },
                          });
                  })
                : Promise.resolve({ data: {}, error: null }),
        );
        const first = renderHook(() => useWatchlistMutation("listing-1"), { wrapper });
        const second = renderHook(() => useWatchlistMutation("listing-2"), { wrapper });

        const failing = first.result.current.mutateAsync("addToWatchlist").catch(() => undefined);
        await waitFor(() => expect(failFirst).toBeDefined());
        await act(() => second.result.current.mutateAsync("addToWatchlist"));
        await act(async () => {
            failFirst();
            await failing;
        });

        expect(watchingIn(searchKey, 0)).toBe(false);
        expect(watchingIn(searchKey, 1)).toBe(true);
    });

    it("does not write into the next viewer's caches after an account switch", async () => {
        let resolveRequest!: (value: { data: object; error: null }) => void;
        mockAdd.mockReturnValue(
            new Promise((resolve) => {
                resolveRequest = resolve;
            }),
        );
        const { result } = renderHook(() => useWatchlistMutation(productListingId), { wrapper });

        const mutation = result.current.mutateAsync("addToWatchlist");
        await waitFor(() => expect(mockAdd).toHaveBeenCalled());
        auth.userId = "user-2";
        const nextViewerSearch = queryClient.getQueryData(searchKey);

        await act(async () => {
            resolveRequest({ data: {}, error: null });
            await mutation;
        });

        expect(queryClient.getQueryData(searchKey)).toBe(nextViewerSearch);
        expect(watchingIn(searchKey)).toBe(false);
    });
});
