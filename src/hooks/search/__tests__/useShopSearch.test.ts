import type { ShopSearchFilterArguments } from "@/data/internal/search/ShopSearchFilterArguments.ts";
import { useShopSearch } from "@/hooks/search/useShopSearch.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSearchShops = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn());

vi.mock("@/client", () => ({
    searchShops: mockSearchShops,
}));

vi.mock("@/hooks/common/useApiError.ts", () => ({
    useApiError: () => ({
        getErrorMessage: mockGetErrorMessage,
    }),
}));

vi.mock("@/data/internal/hooks/ApiError.ts", () => ({
    mapToInternalApiError: (error: unknown) => error,
}));

vi.mock("@/data/internal/shop/ShopDetail.ts", () => ({
    mapToShopDetail: (shop: { shopId: string; name: string }) => ({ ...shop, mapped: true }),
}));

vi.mock("@/env.ts", () => ({
    env: {
        VITE_FEATURE_SEARCH_ENABLED: true,
    },
}));

describe("useShopSearch", () => {
    let queryClient: QueryClient;

    const createWrapper = () => {
        return ({ children }: { children: React.ReactNode }) =>
            createElement(QueryClientProvider, { client: queryClient }, children);
    };

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        });

        mockGetErrorMessage.mockImplementation((error) =>
            error && typeof error === "object" && "message" in error
                ? String((error as { message?: unknown }).message)
                : "Unknown error",
        );

        mockSearchShops.mockResolvedValue({
            data: {
                items: [],
                size: 0,
                total: 0,
                searchAfter: undefined,
            },
            error: null,
        });
    });

    it("does not fetch when query length is below the minimum", async () => {
        const args: ShopSearchFilterArguments = { q: "ab" };

        const { result } = renderHook(() => useShopSearch(args), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.fetchStatus).toBe("idle");
        });

        expect(mockSearchShops).not.toHaveBeenCalled();
    });

    it("calls searchShops with all mapped body fields and query params", async () => {
        const createdFrom = new Date("2024-01-01T00:00:00.000Z");
        const createdTo = new Date("2024-12-31T23:59:59.999Z");
        const updatedFrom = new Date("2025-01-01T00:00:00.000Z");
        const updatedTo = new Date("2025-06-30T23:59:59.999Z");

        const args: ShopSearchFilterArguments = {
            q: "gallery",
            shopType: ["AUCTION_HOUSE", "MARKETPLACE", "UNKNOWN"],
            partnerStatus: ["PARTNERED", "SCRAPED"],
            creationDateFrom: createdFrom,
            creationDateTo: createdTo,
            updateDateFrom: updatedFrom,
            updateDateTo: updatedTo,
            sortField: "NAME",
            sortOrder: "ASC",
        };

        renderHook(() => useShopSearch(args), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(mockSearchShops).toHaveBeenCalledTimes(1);
        });

        expect(mockSearchShops).toHaveBeenCalledWith({
            body: {
                shopNameQuery: "gallery",
                // UNKNOWN is dropped when mapped to backend
                shopType: ["AUCTION_HOUSE", "MARKETPLACE"],
                partnerStatus: ["PARTNERED", "SCRAPED"],
                created: {
                    min: "2024-01-01T00:00:00.000Z",
                    max: "2024-12-31T23:59:59.999Z",
                },
                updated: {
                    min: "2025-01-01T00:00:00.000Z",
                    max: "2025-06-30T23:59:59.999Z",
                },
            },
            query: {
                sort: "name",
                order: "asc",
                searchAfter: undefined,
                size: 30,
            },
        });
    });

    it("omits body filters when none are provided and uses sensible defaults", async () => {
        const args: ShopSearchFilterArguments = { q: "shop" };

        renderHook(() => useShopSearch(args), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(mockSearchShops).toHaveBeenCalledTimes(1);
        });

        const [call] = mockSearchShops.mock.calls;
        expect(call[0].body).toEqual({ shopNameQuery: "shop" });
        expect(call[0].query).toEqual({
            sort: "score",
            order: "desc",
            searchAfter: undefined,
            size: 30,
        });
    });

    it("maps returned items via mapToShopDetail and exposes pagination metadata", async () => {
        mockSearchShops.mockResolvedValueOnce({
            data: {
                items: [
                    { shopId: "s1", name: "Shop One" },
                    { shopId: "s2", name: "Shop Two" },
                ],
                size: 2,
                total: 42,
                searchAfter: ["abc", "s2"],
            },
            error: null,
        });

        const { result } = renderHook(() => useShopSearch({ q: "shop" }), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        const firstPage = result.current.data?.pages[0];
        expect(firstPage?.shops).toHaveLength(2);
        expect(firstPage?.shops[0]).toMatchObject({ shopId: "s1", mapped: true });
        expect(firstPage?.size).toBe(2);
        expect(firstPage?.total).toBe(42);
        expect(firstPage?.searchAfter).toEqual(["abc", "s2"]);
    });

    it("throws a translated error when the API returns an error", async () => {
        mockSearchShops.mockResolvedValueOnce({
            data: null,
            error: { message: "boom" },
        });
        mockGetErrorMessage.mockReturnValueOnce("Something went wrong");

        const { result } = renderHook(() => useShopSearch({ q: "shop" }), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });

        expect((result.current.error as Error).message).toBe("Something went wrong");
        expect(mockGetErrorMessage).toHaveBeenCalled();
    });
});
