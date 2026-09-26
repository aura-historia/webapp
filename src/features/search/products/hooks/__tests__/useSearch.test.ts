import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import { useSearch } from "@/features/search/products/hooks/useSearch.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createQuerySerializer } from "@/client/client/utils.gen.ts";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSearchListings = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn());

vi.mock("@/client", () => ({ simpleSearchProductListings: mockSearchListings }));
vi.mock("@/hooks/common/useApiError.ts", () => ({
    useApiError: () => ({ getErrorMessage: mockGetErrorMessage }),
}));
vi.mock("@/data/internal/hooks/ApiError.ts", () => ({
    mapToInternalApiError: (error: unknown) => error,
}));
vi.mock("@/data/internal/product/ProductListing.ts", () => ({
    mapPersonalizedProductListingSummary: (product: unknown) => product,
}));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ i18n: { language: "de" } }) }));
vi.mock("@/env.ts", () => ({ env: { VITE_FEATURE_SEARCH_ENABLED: true } }));
vi.mock("@/features/preferences/hooks/useUserPreferences.tsx", () => ({
    useUserPreferences: () => ({ preferences: { currency: "EUR" } }),
}));

describe("useSearch", () => {
    let queryClient: QueryClient;

    const createWrapper =
        () =>
        ({ children }: { children: React.ReactNode }) =>
            createElement(QueryClientProvider, { client: queryClient }, children);

    beforeEach(() => {
        vi.clearAllMocks();
        mockSearchListings.mockReset();
        queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
        mockGetErrorMessage.mockReturnValue("Unknown error");
        mockSearchListings.mockResolvedValue({
            data: { items: [], size: 0, total: null, searchAfter: null },
            error: null,
        });
    });

    it("serializes deep ranges, repeated arrays, and the complete FX cursor as one value", () => {
        const cursor = { fxRateId: "fx_abc", searchAfter: ["score", "pl_123", 17] };
        const query = createQuerySerializer()({
            productQuery: ["antique", "vase"],
            listingSourceId: ["ls_1", "ls_2"],
            price: { min: 1000, max: 2000 },
            created: { min: "2026-01-01T00:00:00.000Z" },
            availability: ["IN_STOCK", "SOLD_OUT"],
            searchAfter: JSON.stringify(cursor),
        });

        expect(query).toContain("price[min]=1000");
        expect(query).toContain("price[max]=2000");
        const params = new URLSearchParams(query);
        expect(params.getAll("productQuery")).toEqual(["antique", "vase"]);
        expect(params.getAll("listingSourceId")).toEqual(["ls_1", "ls_2"]);
        expect(params.get("created[min]")).toBe("2026-01-01T00:00:00.000Z");
        expect(params.get("searchAfter")).toBe(JSON.stringify(cursor));
    });

    it("does not fetch until the query reaches its minimum length", async () => {
        const { result } = renderHook(() => useSearch({ q: "ab" }), { wrapper: createWrapper() });
        await waitFor(() => expect(result.current.fetchStatus).toBe("idle"));
        expect(mockSearchListings).not.toHaveBeenCalled();
    });

    it("sends canonical listing filters and maps a nullable total", async () => {
        const args: SearchFilterArguments = {
            q: "antique vase",
            queryTerms: ["antique", "vase"],
            enhancedSearchDescription: "blue porcelain",
            excludeProductId: ["pl_123"],
            listingSourceId: ["ls_1", "ls_2"],
            excludeListingSourceId: ["ls_3"],
            priceFrom: 10,
            priceTo: 20,
            availability: ["IN_STOCK", "SOLD_OUT"],
            creationDateFrom: new Date("2024-01-01T00:00:00.000Z"),
            creationDateTo: new Date("2024-12-31T23:59:59.999Z"),
            updateDateFrom: new Date("2025-01-01T00:00:00.000Z"),
            updateDateTo: new Date("2025-06-30T23:59:59.999Z"),
            auctionDateFrom: new Date("2026-01-01T00:00:00.000Z"),
            auctionDateTo: new Date("2026-02-01T00:00:00.000Z"),
            orderability: ["NOT_ORDERABLE"],
            includeUnspecifiedAvailability: false,
            sortField: "CREATION_DATE",
            sortOrder: "ASC",
        };

        const { result } = renderHook(() => useSearch(args), { wrapper: createWrapper() });
        await waitFor(() => expect(mockSearchListings).toHaveBeenCalledTimes(1));

        const query = mockSearchListings.mock.calls[0][0].query;
        expect(query).toMatchObject({
            language: "de",
            currency: "EUR",
            productQuery: ["antique", "vase"],
            enhancedSearchDescription: "blue porcelain",
            excludeProductId: ["pl_123"],
            listingSourceId: ["ls_1", "ls_2"],
            excludeListingSourceId: ["ls_3"],
            size: 30,
            sort: "created",
            order: "asc",
            price: { min: 1000, max: 2000 },
            availability: ["IN_STOCK", "SOLD_OUT"],
            created: { min: "2024-01-01T00:00:00.000Z", max: "2024-12-31T23:59:59.999Z" },
            updated: { min: "2025-01-01T00:00:00.000Z", max: "2025-06-30T23:59:59.999Z" },
            lotBiddingOpens: { min: "2026-01-01T00:00:00.000Z", max: "2026-02-01T00:00:00.000Z" },
        });
        expect(query).not.toHaveProperty("state");
        expect(query).not.toHaveProperty("shopName");
        expect(query).not.toHaveProperty("sellerName");
        expect(query).not.toHaveProperty("shopType");
        expect(query).not.toHaveProperty("orderability");
        expect(query).not.toHaveProperty("includeUnspecifiedAvailability");
        expect(result.current.data?.pages[0]?.total).toBeUndefined();
    });

    it("preserves the complete FX cursor unchanged through a page chain", async () => {
        const cursor = { fxRateId: "fx_abc", searchAfter: ["score", "pl_123", 17] };
        mockSearchListings
            .mockResolvedValueOnce({
                data: { items: [], size: 30, searchAfter: cursor },
                error: null,
            })
            .mockResolvedValueOnce({
                data: { items: [], size: 0, searchAfter: null },
                error: null,
            });

        const { result } = renderHook(() => useSearch({ q: "vase" }), { wrapper: createWrapper() });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data?.pages[0]?.searchAfter).toEqual(cursor);

        await result.current.fetchNextPage();

        await waitFor(() => expect(mockSearchListings).toHaveBeenCalledTimes(2));
        expect(mockSearchListings.mock.calls[1]?.[0].query.searchAfter).toBe(
            JSON.stringify(cursor),
        );
    });

    it("maps API errors to the internal error message", async () => {
        mockSearchListings.mockResolvedValueOnce({ data: null, error: { message: "api failure" } });
        mockGetErrorMessage.mockReturnValue("Mapped API Error");

        const { result } = renderHook(() => useSearch({ q: "test" }), { wrapper: createWrapper() });
        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error?.message).toBe("Mapped API Error");
    });
});
