import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ProductListing } from "@/data/internal/product/ProductListing.ts";
import { useWatchlistNotificationMutation } from "../useWatchlistNotificationMutation.ts";

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
        watchlist: { watching: true, notifications: false },
        contentVisibility: { showUnassessedOrSensitiveContent: false },
        notification: { unseenNotificationIds: [], hasUnseenNotification: false },
        searchFilter: { matched: false, hidden: false },
    },
} as unknown as ProductListing;

describe("useWatchlistNotificationMutation", () => {
    let queryClient: QueryClient;
    const productListingId = "listing-1";
    const key = ["watchlist", "user-1", "en", "EUR"];
    const wrapper = ({ children }: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children);

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
        });
        queryClient.setQueryData(key, {
            pages: [{ products: [listing], size: 1 }],
            pageParams: [undefined],
        });
        mockErrorMessage.mockImplementation((error) => error?.message ?? "Unknown error");
    });

    it("updates notification state optimistically and sends the canonical path", async () => {
        mockPatch.mockResolvedValue({
            data: { userId: "user-1", productListingId, notifications: true, state: "ACTIVE" },
            error: null,
        });
        const { result } = renderHook(() => useWatchlistNotificationMutation(productListingId), {
            wrapper,
        });

        await result.current.mutateAsync(true);

        expect(mockPatch).toHaveBeenCalledWith({
            path: { productListingId },
            body: { notifications: true },
        });
        const cached = queryClient.getQueryData<{ pages: Array<{ products: ProductListing[] }> }>(
            key,
        );
        expect(cached?.pages[0].products[0].userState?.watchlist.notifications).toBe(true);
        expect(cached?.pages[0].products[0]).toHaveProperty("source");
    });

    it("rolls back a failed notification change", async () => {
        mockPatch.mockResolvedValue({
            data: null,
            error: { message: "Unavailable" },
            response: { status: 500 },
        });
        mockErrorMessage.mockReturnValue("Unavailable");
        const { result } = renderHook(() => useWatchlistNotificationMutation(productListingId), {
            wrapper,
        });

        await expect(result.current.mutateAsync(true)).rejects.toThrow("Unavailable");
        expect(
            queryClient.getQueryData<{ pages: Array<{ products: ProductListing[] }> }>(key)
                ?.pages[0].products[0].userState?.watchlist.notifications,
        ).toBe(false);
        expect(mockToast.error).toHaveBeenCalled();
    });
});
