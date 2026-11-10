import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";

const mockPreviewMatches = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn(() => "Fehler"));

vi.mock("@/client", () => ({ previewUserSearchFilterMatches: mockPreviewMatches }));
vi.mock("@/hooks/common/useApiError", () => ({
    useApiError: () => ({ getErrorMessage: mockGetErrorMessage }),
}));
vi.mock("@/data/internal/hooks/ApiError", () => ({ mapToInternalApiError: (e: unknown) => e }));
vi.mock("@/features/preferences/hooks/useUserPreferences.tsx", () => ({
    useUserPreferences: () => ({ preferences: { currency: "EUR" } }),
}));
vi.mock("react-i18next", () => ({
    useTranslation: () => ({ i18n: { language: "en" } }),
}));
vi.mock("@/data/internal/product/ProductListing.ts", () => ({
    mapPersonalizedProductListingSummary: vi.fn(() => ({ productListingId: "listing-1" })),
}));

import {
    SearchFilterPreviewError,
    useSearchFilterPreviewProducts,
} from "../useSearchFilterPreviewProducts.ts";

const baseSearch: SearchFilterArguments = {
    q: "Tisch",
    queryTerms: ["Tisch", "Stuhl"],
    priceFrom: 10,
    availability: ["AVAILABLE"],
    listingSourceId: ["source-1"],
};

describe("useSearchFilterPreviewProducts", () => {
    let queryClient: QueryClient;
    const createWrapper =
        () =>
        ({ children }: { children: React.ReactNode }) =>
            createElement(QueryClientProvider, { client: queryClient }, children);

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false, retryDelay: 0 } },
        });
    });

    it("calls the classifier-accurate preview endpoint with the create-filter search mapping", async () => {
        mockPreviewMatches.mockResolvedValue({
            data: { items: [{ productListingId: "listing-1" }], candidateLimitReached: false },
            error: null,
        });

        const { result } = renderHook(() => useSearchFilterPreviewProducts(baseSearch, true), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual({
            items: [{ productListingId: "listing-1" }],
            candidateLimitReached: false,
        });
        expect(mockPreviewMatches).toHaveBeenCalledWith({
            body: {
                search: expect.objectContaining({
                    productQuery: ["Tisch", "Stuhl"],
                    listingSourceId: ["source-1"],
                    price: { min: 1000, max: undefined },
                    currency: "EUR",
                }),
            },
        });
        // The preview never sends `size`: there is no paging on this endpoint.
        expect(mockPreviewMatches.mock.calls[0][0].body.search).not.toHaveProperty("size");
    });

    it("returns candidateLimitReached alongside the items", async () => {
        mockPreviewMatches.mockResolvedValue({
            data: { items: [], candidateLimitReached: true },
            error: null,
        });

        const { result } = renderHook(() => useSearchFilterPreviewProducts(baseSearch, true), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual({ items: [], candidateLimitReached: true });
    });

    it("does not fetch when disabled", () => {
        const { result } = renderHook(() => useSearchFilterPreviewProducts(baseSearch, false), {
            wrapper: createWrapper(),
        });

        expect(result.current.fetchStatus).toBe("idle");
        expect(mockPreviewMatches).not.toHaveBeenCalled();
    });

    it("returns no preview results when every availability option is unchecked", async () => {
        const { result } = renderHook(
            () => useSearchFilterPreviewProducts({ ...baseSearch, availability: [] }, true),
            { wrapper: createWrapper() },
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual({ items: [], candidateLimitReached: false });
        expect(mockPreviewMatches).not.toHaveBeenCalled();
    });

    it("previews an orderability-only filter instead of reporting no matches", async () => {
        mockPreviewMatches.mockResolvedValue({
            data: { items: [], candidateLimitReached: false },
            error: null,
        });

        const { result } = renderHook(
            () =>
                useSearchFilterPreviewProducts(
                    {
                        ...baseSearch,
                        availability: [],
                        orderability: ["ORDERABLE_NOW"],
                        includeUnspecifiedAvailability: false,
                    },
                    true,
                ),
            { wrapper: createWrapper() },
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(mockPreviewMatches).toHaveBeenCalledWith({
            body: {
                search: expect.objectContaining({
                    orderability: ["ORDERABLE_NOW"],
                    includeUnspecifiedAvailability: false,
                }),
            },
        });
    });

    it("exposes a SearchFilterPreviewError with the backend error code", async () => {
        mockPreviewMatches.mockResolvedValue({
            data: null,
            error: { status: 422, error: "SEARCH_FILTER_RESTRICTED_FEATURE" },
        });

        const { result } = renderHook(() => useSearchFilterPreviewProducts(baseSearch, true), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error).toBeInstanceOf(SearchFilterPreviewError);
        expect((result.current.error as SearchFilterPreviewError).code).toBe(
            "SEARCH_FILTER_RESTRICTED_FEATURE",
        );
    });

    it("retries a temporarily-unavailable classifier exactly once", async () => {
        queryClient = new QueryClient({ defaultOptions: { queries: { retryDelay: 0 } } });
        mockPreviewMatches.mockResolvedValue({
            data: null,
            error: { status: 503, error: "SEARCH_FILTER_TEMPORARILY_UNAVAILABLE" },
        });

        const { result } = renderHook(() => useSearchFilterPreviewProducts(baseSearch, true), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(mockPreviewMatches).toHaveBeenCalledTimes(2);
        expect((result.current.error as SearchFilterPreviewError).code).toBe(
            "SEARCH_FILTER_TEMPORARILY_UNAVAILABLE",
        );
    });

    it("never retries a restricted-field error", async () => {
        queryClient = new QueryClient({ defaultOptions: { queries: { retryDelay: 0 } } });
        mockPreviewMatches.mockResolvedValue({
            data: null,
            error: { status: 422, error: "SEARCH_FILTER_RESTRICTED_FEATURE" },
        });

        const { result } = renderHook(() => useSearchFilterPreviewProducts(baseSearch, true), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(mockPreviewMatches).toHaveBeenCalledTimes(1);
    });
});
