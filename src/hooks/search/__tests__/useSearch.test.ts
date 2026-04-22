import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import { useSearch } from "@/hooks/search/useSearch.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSimpleSearchProducts = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn());

vi.mock("@/client", () => ({
    simpleSearchProducts: mockSimpleSearchProducts,
}));

vi.mock("@/hooks/common/useApiError.ts", () => ({
    useApiError: () => ({
        getErrorMessage: mockGetErrorMessage,
    }),
}));

vi.mock("@/data/internal/hooks/ApiError.ts", () => ({
    mapToInternalApiError: (error: unknown) => error,
}));

vi.mock("@/data/internal/product/OverviewProduct.ts", () => ({
    mapPersonalizedGetProductSummaryDataToOverviewProduct: (product: unknown) => product,
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        i18n: { language: "de" },
    }),
}));

vi.mock("@/env.ts", () => ({
    env: {
        VITE_FEATURE_SEARCH_ENABLED: true,
    },
}));

vi.mock("@/hooks/preferences/useUserPreferences.tsx", () => ({
    useUserPreferences: () => ({ preferences: { currency: "EUR" }, updatePreferences: vi.fn() }),
}));

describe("useSearch", () => {
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

        mockSimpleSearchProducts.mockResolvedValue({
            data: {
                items: [],
                size: 0,
                total: 0,
                searchAfter: undefined,
            },
            error: null,
        });
    });

    it("does not fetch when query length is below minimum", async () => {
        const args: SearchFilterArguments = { q: "ab" };

        const { result } = renderHook(() => useSearch(args), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.fetchStatus).toBe("idle");
        });

        expect(mockSimpleSearchProducts).not.toHaveBeenCalled();
    });

    it("uses simpleSearchProducts GET with mapped query filters", async () => {
        const createdFrom = new Date("2024-01-01T00:00:00.000Z");
        const createdTo = new Date("2024-12-31T23:59:59.999Z");
        const updatedFrom = new Date("2025-01-01T00:00:00.000Z");
        const updatedTo = new Date("2025-06-30T23:59:59.999Z");
        const auctionFrom = new Date("2026-01-01T00:00:00.000Z");
        const auctionTo = new Date("2026-02-01T00:00:00.000Z");

        const args: SearchFilterArguments = {
            q: "renaissance",
            priceFrom: 10,
            priceTo: 20,
            allowedStates: ["AVAILABLE"],
            creationDateFrom: createdFrom,
            creationDateTo: createdTo,
            updateDateFrom: updatedFrom,
            updateDateTo: updatedTo,
            auctionDateFrom: auctionFrom,
            auctionDateTo: auctionTo,
            merchant: ["Aurora Gallery"],
            excludeMerchant: ["Other Shop"],
            shopType: ["UNKNOWN", "AUCTION_HOUSE"],
            periodId: ["renaissance"],
            sortField: "PRICE",
            sortOrder: "ASC",
            originYearMin: 1500,
            originYearMax: 1650,
            authenticity: ["ORIGINAL", "UNKNOWN"],
            condition: ["GREAT", "UNKNOWN"],
            provenance: ["COMPLETE", "UNKNOWN"],
            restoration: ["MINOR", "UNKNOWN"],
        };

        renderHook(() => useSearch(args), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(mockSimpleSearchProducts).toHaveBeenCalledTimes(1);
        });

        expect(mockSimpleSearchProducts).toHaveBeenCalledWith({
            query: expect.objectContaining({
                language: "de",
                currency: "EUR",
                productQuery: "renaissance",
                size: 30,
                sort: "price",
                order: "asc",
                price: { min: 1000, max: 2000 },
                state: ["AVAILABLE"],
                created: {
                    min: "2024-01-01T00:00:00.000Z",
                    max: "2024-12-31T23:59:59.999Z",
                },
                updated: {
                    min: "2025-01-01T00:00:00.000Z",
                    max: "2025-06-30T23:59:59.999Z",
                },
                auctionStart: {
                    min: "2026-01-01T00:00:00.000Z",
                    max: "2026-02-01T00:00:00.000Z",
                },
                shopName: ["Aurora Gallery"],
                excludeShopName: ["Other Shop"],
                shopType: ["AUCTION_HOUSE"],
                periodId: ["renaissance"],
                originYear: { min: 1500, max: 1650 },
                authenticity: ["ORIGINAL", "UNKNOWN"],
                condition: ["GREAT", "UNKNOWN"],
                provenance: ["COMPLETE", "UNKNOWN"],
                restoration: ["MINOR", "UNKNOWN"],
            }),
        });
    });

    it("returns a mapped error when API responds with error", async () => {
        mockSimpleSearchProducts.mockResolvedValue({
            data: null,
            error: { message: "api failure" },
        });
        mockGetErrorMessage.mockReturnValue("Mapped API Error");

        const { result } = renderHook(() => useSearch({ q: "test" }), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });

        expect(result.current.error?.message).toBe("Mapped API Error");
    });
});
