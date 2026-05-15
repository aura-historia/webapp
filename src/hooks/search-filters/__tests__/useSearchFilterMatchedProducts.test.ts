import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";

const mockGetSearchFilterMatchedProducts = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn(() => "Fehler"));

vi.mock("@/client", () => ({ getSearchFilterMatchedProducts: mockGetSearchFilterMatchedProducts }));
vi.mock("@/hooks/common/useApiError", () => ({
    useApiError: () => ({ getErrorMessage: mockGetErrorMessage }),
}));
vi.mock("@/data/internal/hooks/ApiError", () => ({ mapToInternalApiError: (e: unknown) => e }));
vi.mock("@/hooks/preferences/useUserPreferences.tsx", () => ({
    useUserPreferences: () => ({ preferences: { currency: "EUR" } }),
}));

vi.mock("@/data/internal/search-filter/SearchFilterMatchProductCollection.ts", () => ({
    mapToInternalSearchFilterMatchProductCollection: vi.fn(
        (data: {
            items: unknown[];
            size: number;
            searchAfter?: string | null;
            total?: number | null;
        }) => ({
            items: data.items.map(() => ({ shopId: "shop-1" })),
            size: data.size,
            searchAfter: data.searchAfter ?? undefined,
            total: data.total ?? undefined,
        }),
    ),
}));

import { useSearchFilterMatchedProducts } from "../useSearchFilterMatchedProducts.ts";

const mockItem = {
    shopId: "shop-1",
    shopsProductId: "prod-1",
    shopSlugId: "shop-slug",
    productSlugId: "prod-slug",
    title: "Barocktisch",
    shopName: "Antik AG",
    shopType: "AUCTION_HOUSE" as const,
    state: "AVAILABLE" as const,
    images: [],
};

const mockPageData = {
    items: [mockItem],
    size: 1,
    searchAfter: null,
    total: 1,
};

describe("useSearchFilterMatchedProducts", () => {
    let queryClient: QueryClient;
    const createWrapper =
        () =>
        ({ children }: { children: React.ReactNode }) =>
            createElement(QueryClientProvider, { client: queryClient }, children);

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    });

    it("fetches matched products and returns first page", async () => {
        mockGetSearchFilterMatchedProducts.mockResolvedValue({ data: mockPageData, error: null });

        const { result } = renderHook(() => useSearchFilterMatchedProducts("filter-1"), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data?.pages[0].items).toHaveLength(1);
        expect(result.current.data?.pages[0].items[0].shopId).toBe("shop-1");
    });

    it("calls API with correct path and query params", async () => {
        mockGetSearchFilterMatchedProducts.mockResolvedValue({ data: mockPageData, error: null });

        renderHook(() => useSearchFilterMatchedProducts("filter-abc"), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(mockGetSearchFilterMatchedProducts).toHaveBeenCalled());

        expect(mockGetSearchFilterMatchedProducts).toHaveBeenCalledWith(
            expect.objectContaining({
                path: { userSearchFilterId: "filter-abc" },
                query: expect.objectContaining({ sort: "created", order: "desc", size: 20 }),
            }),
        );
    });

    it("does not fetch when id is empty", () => {
        const { result } = renderHook(() => useSearchFilterMatchedProducts(""), {
            wrapper: createWrapper(),
        });

        expect(result.current.fetchStatus).toBe("idle");
        expect(mockGetSearchFilterMatchedProducts).not.toHaveBeenCalled();
    });

    it("sets isError when API returns error", async () => {
        mockGetSearchFilterMatchedProducts.mockResolvedValue({
            data: null,
            error: { status: 403 },
        });

        const { result } = renderHook(() => useSearchFilterMatchedProducts("filter-1"), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
    });

    it("returns undefined nextPageParam when searchAfter is null", async () => {
        mockGetSearchFilterMatchedProducts.mockResolvedValue({ data: mockPageData, error: null });

        const { result } = renderHook(() => useSearchFilterMatchedProducts("filter-1"), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.hasNextPage).toBe(false);
    });
});
