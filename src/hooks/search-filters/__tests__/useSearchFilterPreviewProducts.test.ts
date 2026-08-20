import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";

const mockGetSearchFilterPreviewProducts = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn(() => "Fehler"));

vi.mock("@/client", () => ({ getSearchFilterPreviewProducts: mockGetSearchFilterPreviewProducts }));
vi.mock("@/hooks/common/useApiError", () => ({
    useApiError: () => ({ getErrorMessage: mockGetErrorMessage }),
}));
vi.mock("@/data/internal/hooks/ApiError", () => ({ mapToInternalApiError: (e: unknown) => e }));
vi.mock("@/features/preferences/hooks/useUserPreferences.tsx", () => ({
    useUserPreferences: () => ({ preferences: { currency: "EUR" } }),
}));

vi.mock("@/data/internal/product/OverviewProduct.ts", () => ({
    mapPersonalizedGetProductSummaryDataToOverviewProduct: vi.fn(() => ({ shopId: "shop-1" })),
}));

import { useSearchFilterPreviewProducts } from "../useSearchFilterPreviewProducts.ts";

const mockData = {
    items: [{ shopId: "shop-1" }],
    size: 1,
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

    it("fetches live products and returns mapped data", async () => {
        mockGetSearchFilterPreviewProducts.mockResolvedValue({ data: mockData, error: null });

        const { result } = renderHook(() => useSearchFilterPreviewProducts("filter-1", true), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toHaveLength(1);
        expect(result.current.data?.[0].shopId).toBe("shop-1");
    });

    it("calls API with correct path and query params", async () => {
        mockGetSearchFilterPreviewProducts.mockResolvedValue({ data: mockData, error: null });

        renderHook(() => useSearchFilterPreviewProducts("filter-abc", true), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(mockGetSearchFilterPreviewProducts).toHaveBeenCalled());

        expect(mockGetSearchFilterPreviewProducts).toHaveBeenCalledWith(
            expect.objectContaining({
                path: { userSearchFilterId: "filter-abc" },
                query: expect.objectContaining({ currency: "EUR" }),
            }),
        );
    });

    it("does not fetch when id is empty", () => {
        const { result } = renderHook(() => useSearchFilterPreviewProducts("", true), {
            wrapper: createWrapper(),
        });

        expect(result.current.fetchStatus).toBe("idle");
        expect(mockGetSearchFilterPreviewProducts).not.toHaveBeenCalled();
    });

    it("does not fetch when enabled is false", () => {
        const { result } = renderHook(() => useSearchFilterPreviewProducts("filter-1", false), {
            wrapper: createWrapper(),
        });

        expect(result.current.fetchStatus).toBe("idle");
        expect(mockGetSearchFilterPreviewProducts).not.toHaveBeenCalled();
    });

    it("sets isError when API returns error", async () => {
        mockGetSearchFilterPreviewProducts.mockResolvedValue({
            data: null,
            error: { status: 403 },
        });

        const { result } = renderHook(() => useSearchFilterPreviewProducts("filter-1", true), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
    });
});
