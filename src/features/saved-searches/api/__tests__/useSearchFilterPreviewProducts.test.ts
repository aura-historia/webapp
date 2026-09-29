import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";

const mockSearchListings = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn(() => "Fehler"));

vi.mock("@/client", () => ({ simpleSearchProductListings: mockSearchListings }));
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
    canPreviewSavedSearch,
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
        queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    });

    it("uses canonical listing search and maps its results", async () => {
        mockSearchListings.mockResolvedValue({
            data: { items: [{ productListingId: "listing-1" }] },
            error: null,
        });

        const { result } = renderHook(() => useSearchFilterPreviewProducts(baseSearch, true), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual([{ productListingId: "listing-1" }]);
        expect(mockSearchListings).toHaveBeenCalledWith({
            query: expect.objectContaining({
                productQuery: ["Tisch", "Stuhl"],
                listingSourceId: ["source-1"],
                price: { min: 1000, max: undefined },
                size: 4,
            }),
        });
    });

    it("does not fetch when disabled", () => {
        const { result } = renderHook(() => useSearchFilterPreviewProducts(baseSearch, false), {
            wrapper: createWrapper(),
        });

        expect(result.current.fetchStatus).toBe("idle");
        expect(mockSearchListings).not.toHaveBeenCalled();
    });

    it("does not broaden criteria the listing search endpoint cannot express", () => {
        expect(canPreviewSavedSearch({ ...baseSearch, orderability: ["ORDERABLE_NOW"] })).toBe(
            false,
        );
        expect(
            canPreviewSavedSearch({ ...baseSearch, includeUnspecifiedAvailability: false }),
        ).toBe(false);
    });

    it("does not fetch when GET cannot express the saved criteria", () => {
        const { result } = renderHook(
            () =>
                useSearchFilterPreviewProducts(
                    { ...baseSearch, orderability: ["ORDERABLE_NOW"] },
                    true,
                ),
            { wrapper: createWrapper() },
        );

        expect(result.current.fetchStatus).toBe("idle");
        expect(mockSearchListings).not.toHaveBeenCalled();
    });

    it("exposes API failures as query errors", async () => {
        mockSearchListings.mockResolvedValue({ data: null, error: { status: 403 } });

        const { result } = renderHook(() => useSearchFilterPreviewProducts(baseSearch, true), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
    });
});
