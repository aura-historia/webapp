import { createElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAdminShop, useAdminShops } from "../useAdminShops.ts";

const mockSimpleSearchShops = vi.hoisted(() => vi.fn());
const mockGetShopById = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn());

vi.mock("@/client", () => ({
    simpleSearchShops: mockSimpleSearchShops,
    getShopById: mockGetShopById,
}));

vi.mock("@/hooks/common/useApiError.ts", () => ({
    useApiError: () => ({
        getErrorMessage: mockGetErrorMessage,
    }),
}));

vi.mock("@/data/internal/hooks/ApiError.ts", () => ({
    mapToInternalApiError: (error: unknown) => error,
}));

describe("useAdminShops", () => {
    let queryClient: QueryClient;

    const createWrapper =
        () =>
        ({ children }: { children: React.ReactNode }) =>
            createElement(QueryClientProvider, { client: queryClient }, children);

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        });
        mockGetErrorMessage.mockImplementation((error: unknown) =>
            error && typeof error === "object" && "message" in error
                ? String((error as { message?: unknown }).message)
                : "Unknown error",
        );
    });

    it("loads admin shops", async () => {
        mockSimpleSearchShops.mockResolvedValue({
            data: {
                items: [
                    {
                        shopId: "shop-1",
                        shopSlugId: "aurora-antiques",
                        name: "Aurora Antiques",
                        shopType: "AUCTION_HOUSE",
                        partnerStatus: "PARTNERED",
                        domains: ["aurora.example.com"],
                        created: "2024-01-01T00:00:00Z",
                        updated: "2024-01-02T00:00:00Z",
                    },
                ],
                total: 1,
                searchAfter: undefined,
            },
            error: null,
        });

        const { result } = renderHook(() => useAdminShops({ nameQuery: "aurora" }), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(mockSimpleSearchShops).toHaveBeenCalledWith({
            query: expect.objectContaining({
                shopNameQuery: "aurora",
                sort: "updated",
                order: "desc",
                size: 25,
            }),
        });
        expect(result.current.data?.pages[0]?.items[0]).toMatchObject({
            shopId: "shop-1",
            name: "Aurora Antiques",
        });
    });

    it("refetches admin shop search results on remount instead of reusing cached list data", async () => {
        mockSimpleSearchShops.mockResolvedValue({
            data: {
                items: [
                    {
                        shopId: "shop-1",
                        shopSlugId: "aurora-antiques",
                        name: "Aurora Antiques",
                        shopType: "AUCTION_HOUSE",
                        partnerStatus: "PARTNERED",
                        domains: ["aurora.example.com"],
                        created: "2024-01-01T00:00:00Z",
                        updated: "2024-01-02T00:00:00Z",
                    },
                ],
                total: 1,
                searchAfter: undefined,
            },
            error: null,
        });

        const firstRender = renderHook(() => useAdminShops({ nameQuery: "aurora" }), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(firstRender.result.current.isSuccess).toBe(true));
        firstRender.unmount();

        const secondRender = renderHook(() => useAdminShops({ nameQuery: "aurora" }), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(secondRender.result.current.isSuccess).toBe(true));

        expect(mockSimpleSearchShops).toHaveBeenCalledTimes(2);
    });

    it("refetches admin shop detail on remount instead of reusing cached data", async () => {
        mockGetShopById.mockResolvedValue({
            data: {
                shopId: "shop-1",
                shopSlugId: "aurora-antiques",
                name: "Aurora Antiques",
                shopType: "AUCTION_HOUSE",
                partnerStatus: "PARTNERED",
                domains: ["aurora.example.com"],
                shopifyDomain: "aurora.myshopify.com",
                shopifyCurrency: "EUR",
                shopifyLanguage: "de",
                url: "https://aurora.example.com",
                image: "https://example.com/logo.png",
                created: "2024-01-01T00:00:00Z",
                updated: "2024-01-02T00:00:00Z",
            },
            error: null,
        });

        const firstRender = renderHook(() => useAdminShop("shop-1"), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(firstRender.result.current.isSuccess).toBe(true));
        firstRender.unmount();

        const secondRender = renderHook(() => useAdminShop("shop-1"), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(secondRender.result.current.isSuccess).toBe(true));

        expect(mockGetShopById).toHaveBeenCalledTimes(2);
    });
});
