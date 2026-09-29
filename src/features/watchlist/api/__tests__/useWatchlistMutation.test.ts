import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ProductListing } from "@/data/internal/product/ProductListing.ts";
import { useWatchlistMutation } from "../useWatchlistMutation.ts";

const mockAdd = vi.hoisted(() => vi.fn());
const mockDelete = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn());
const mockToast = vi.hoisted(() => ({ info: vi.fn(), warning: vi.fn(), error: vi.fn() }));

vi.mock("@/client", () => ({ addWatchlistProduct: mockAdd, deleteWatchlistProduct: mockDelete }));
vi.mock("sonner", () => ({ toast: mockToast }));
vi.mock("@/hooks/common/useApiError.ts", () => ({
    useApiError: () => ({ getErrorMessage: mockGetErrorMessage }),
}));
vi.mock("@/data/internal/hooks/ApiError.ts", () => ({
    mapToInternalApiError: (error: unknown) => error,
}));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

const listing = {
    productListingId: "listing-1",
    sourceListingId: "source-item-1",
    source: { listingSourceId: "source-1", name: "Source", slugId: "source" },
    userState: {
        watchlist: { watching: false, notifications: true },
        contentVisibility: { showUnassessedOrSensitiveContent: false },
        notification: { unseenNotificationIds: [], hasUnseenNotification: false },
        searchFilter: { matched: false, hidden: false },
    },
} as unknown as ProductListing;
const watchedListing: ProductListing = {
    ...listing,
    userState: {
        contentVisibility: { showUnassessedOrSensitiveContent: false },
        notification: { unseenNotificationIds: [], hasUnseenNotification: false },
        searchFilter: { matched: false, hidden: false },
        watchlist: { watching: true, notifications: true },
    },
};

describe("useWatchlistMutation", () => {
    let queryClient: QueryClient;
    const productListingId = "listing-1";
    const watchlistKey = ["watchlist", "user-1", "en", "EUR"];
    const searchKey = ["search", {}, "en", "EUR"];
    const wrapper = ({ children }: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children);

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
        });
        queryClient.setQueryData(watchlistKey, {
            pages: [{ products: [listing], size: 1 }],
            pageParams: [undefined],
        });
        queryClient.setQueryData(searchKey, {
            pages: [{ products: [listing], total: 1 }],
            pageParams: [undefined],
        });
        mockGetErrorMessage.mockImplementation((error) => error?.message ?? "Unknown error");
    });

    it("adds by canonical listing ID and keeps the entry response out of listing caches", async () => {
        mockAdd.mockResolvedValue({
            data: { userId: "user-1", productListingId, notifications: true, state: "ACTIVE" },
            error: null,
        });
        const { result } = renderHook(() => useWatchlistMutation(productListingId), { wrapper });

        await result.current.mutateAsync("addToWatchlist");

        expect(mockAdd).toHaveBeenCalledWith({ body: { productListingId } });
        const cached = queryClient.getQueryData<{ pages: Array<{ products: ProductListing[] }> }>(
            watchlistKey,
        );
        expect(cached?.pages[0].products[0]).toMatchObject({
            productListingId,
            source: { listingSourceId: "source-1" },
            userState: { watchlist: { watching: true } },
        });
    });

    it("removes only the watchlist row on delete and updates other listing views", async () => {
        queryClient.setQueryData(watchlistKey, {
            pages: [{ products: [watchedListing], size: 1 }],
            pageParams: [undefined],
        });
        queryClient.setQueryData(searchKey, {
            pages: [{ products: [watchedListing], total: 1 }],
            pageParams: [undefined],
        });
        mockDelete.mockResolvedValue({ data: {}, error: null });
        const { result } = renderHook(() => useWatchlistMutation(productListingId), { wrapper });

        await result.current.mutateAsync("deleteFromWatchlist");

        expect(mockDelete).toHaveBeenCalledWith({ path: { productListingId } });
        expect(
            queryClient.getQueryData<{ pages: Array<{ products: ProductListing[] }> }>(watchlistKey)
                ?.pages[0].products,
        ).toEqual([]);
        expect(
            queryClient.getQueryData<{ pages: Array<{ products: ProductListing[] }> }>(searchKey)
                ?.pages[0].products[0].userState?.watchlist.watching,
        ).toBe(false);
    });

    it("rolls back optimistic state on a duplicate-add conflict and refreshes cached views", async () => {
        mockAdd.mockResolvedValue({
            data: null,
            error: { message: "Already on the watchlist" },
            response: { status: 409 },
        });
        const invalidate = vi.spyOn(queryClient, "invalidateQueries");
        const { result } = renderHook(() => useWatchlistMutation(productListingId), { wrapper });

        await expect(result.current.mutateAsync("addToWatchlist")).rejects.toThrow(
            "Already on the watchlist",
        );
        await waitFor(() => expect(mockToast.warning).toHaveBeenCalled());
        expect(
            queryClient.getQueryData<{ pages: Array<{ products: ProductListing[] }> }>(searchKey)
                ?.pages[0].products[0].userState?.watchlist.watching,
        ).toBe(false);
        expect(invalidate).toHaveBeenCalledWith({ queryKey: ["watchlist"] });
        expect(invalidate).toHaveBeenCalledWith({ queryKey: ["searchFilterMatchedProducts"] });
    });

    it("restores the watchlist row and related listing state when deletion fails", async () => {
        queryClient.setQueryData(watchlistKey, {
            pages: [{ products: [watchedListing], size: 1 }],
            pageParams: [undefined],
        });
        queryClient.setQueryData(searchKey, {
            pages: [{ products: [watchedListing], total: 1 }],
            pageParams: [undefined],
        });
        mockDelete.mockResolvedValue({
            data: null,
            error: { message: "Deletion failed" },
            response: { status: 500 },
        });
        mockGetErrorMessage.mockReturnValue("Deletion failed");
        const { result } = renderHook(() => useWatchlistMutation(productListingId), { wrapper });

        await expect(result.current.mutateAsync("deleteFromWatchlist")).rejects.toThrow(
            "Deletion failed",
        );
        expect(
            queryClient.getQueryData<{ pages: Array<{ products: ProductListing[] }> }>(watchlistKey)
                ?.pages[0].products,
        ).toHaveLength(1);
        expect(
            queryClient.getQueryData<{ pages: Array<{ products: ProductListing[] }> }>(searchKey)
                ?.pages[0].products[0].userState?.watchlist.watching,
        ).toBe(true);
    });
});
