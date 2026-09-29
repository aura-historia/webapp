import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ProductListing } from "@/data/internal/product/ProductListing.ts";
import { useWatchlistStateMutation } from "../useWatchlistStateMutation.ts";

const mockPatch = vi.hoisted(() => vi.fn());
const mockErrorMessage = vi.hoisted(() => vi.fn());
const mockToast = vi.hoisted(() => ({ info: vi.fn(), error: vi.fn() }));
vi.mock("@/client", () => ({ patchWatchlistProduct: mockPatch }));
vi.mock("sonner", () => ({ toast: mockToast }));
vi.mock("@/hooks/common/useApiError.ts", () => ({
    useApiError: () => ({ getErrorMessage: mockErrorMessage }),
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
        watchlist: { watching: true, notifications: true },
        contentVisibility: { showUnassessedOrSensitiveContent: false },
        notification: { unseenNotificationIds: [], hasUnseenNotification: false },
        searchFilter: { matched: false, hidden: false },
    },
} as unknown as ProductListing;

describe("useWatchlistStateMutation", () => {
    let queryClient: QueryClient;
    const productListingId = "listing-1";
    const watchlistKey = ["watchlist", "user-1", "en", "EUR"];
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
        mockErrorMessage.mockImplementation((error) => error?.message ?? "Unknown error");
    });

    it.each([
        [true, "ACTIVE"],
        [false, "INACTIVE_BY_USER"],
    ] as const)("sets %s state through the canonical listing endpoint", async (active, state) => {
        mockPatch.mockResolvedValue({
            data: { userId: "user-1", productListingId, notifications: true, state },
            error: null,
        });
        const { result } = renderHook(() => useWatchlistStateMutation(productListingId), {
            wrapper,
        });

        await result.current.mutateAsync(active);

        expect(mockPatch).toHaveBeenCalledWith({ path: { productListingId }, body: { state } });
        const cached = queryClient.getQueryData<{ pages: Array<{ products: ProductListing[] }> }>(
            watchlistKey,
        );
        if (active) {
            expect(cached?.pages[0].products[0]).toMatchObject({
                productListingId,
                userState: { watchlist: { watching: true, notifications: true } },
            });
        } else {
            expect(cached?.pages[0].products).toHaveLength(0);
        }
    });

    it("rolls back an unsuccessful resource-state change", async () => {
        mockPatch.mockResolvedValue({
            data: null,
            error: { message: "Unavailable" },
            response: { status: 500 },
        });
        mockErrorMessage.mockReturnValue("Unavailable");
        const { result } = renderHook(() => useWatchlistStateMutation(productListingId), {
            wrapper,
        });

        await expect(result.current.mutateAsync(false)).rejects.toThrow("Unavailable");
        expect(
            queryClient.getQueryData<{ pages: Array<{ products: ProductListing[] }> }>(watchlistKey)
                ?.pages[0].products[0].userState?.watchlist.watching,
        ).toBe(true);
        expect(mockToast.error).toHaveBeenCalled();
    });
});
