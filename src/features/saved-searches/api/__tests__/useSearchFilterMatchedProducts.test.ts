import { renderHook, waitFor, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";

const mockListMatches = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn(() => "Fehler"));

vi.mock("@/client", () => ({ listSearchFilterMatches: mockListMatches }));
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
vi.mock("@/data/internal/search-filter/SearchFilterMatchProductCollection.ts", () => ({
    mapToInternalSearchFilterMatchProductCollection: vi.fn(
        (data: {
            items: unknown[];
            size: number;
            searchAfter?: [string, string];
            total?: number;
        }) => ({
            items: data.items.map(() => ({ productListingId: "listing-1" })),
            size: data.size,
            searchAfter: data.searchAfter ? JSON.stringify(data.searchAfter) : undefined,
            total: data.total,
        }),
    ),
}));

import { useSearchFilterMatchedProducts } from "../useSearchFilterMatchedProducts.ts";

const nextCursor: [string, string] = ["2026-09-20T12:00:00Z", "listing-1"];
const mockPageData = {
    items: [{}],
    size: 1,
    searchAfter: nextCursor,
    total: 2,
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

    it("loads persisted matches and maps listing identities", async () => {
        mockListMatches.mockResolvedValue({ data: mockPageData, error: null });

        const { result } = renderHook(() => useSearchFilterMatchedProducts("filter-1"), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data?.pages[0].items[0].productListingId).toBe("listing-1");
        expect(result.current.hasNextPage).toBe(true);
    });

    it("uses fixed endpoint pagination without obsolete sort controls", async () => {
        mockListMatches.mockResolvedValue({ data: mockPageData, error: null });

        renderHook(() => useSearchFilterMatchedProducts("filter-abc"), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(mockListMatches).toHaveBeenCalled());
        expect(mockListMatches).toHaveBeenCalledWith({
            path: { userSearchFilterId: "filter-abc" },
            query: expect.objectContaining({ language: "en", currency: "EUR", size: 20 }),
        });
        expect(mockListMatches.mock.calls[0][0].query).not.toHaveProperty("sort");
        expect(mockListMatches.mock.calls[0][0].query).not.toHaveProperty("order");
    });

    it("serializes the tuple cursor as one query value for the next page", async () => {
        mockListMatches.mockResolvedValue({ data: mockPageData, error: null });

        const { result } = renderHook(() => useSearchFilterMatchedProducts("filter-1"), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.hasNextPage).toBe(true));
        await act(async () => result.current.fetchNextPage());

        await waitFor(() => expect(mockListMatches).toHaveBeenCalledTimes(2));
        expect(mockListMatches.mock.calls[1][0].query.searchAfter).toBe(JSON.stringify(nextCursor));
    });

    it("does not fetch without a filter ID", () => {
        const { result } = renderHook(() => useSearchFilterMatchedProducts(""), {
            wrapper: createWrapper(),
        });

        expect(result.current.fetchStatus).toBe("idle");
        expect(mockListMatches).not.toHaveBeenCalled();
    });

    it("exposes API errors", async () => {
        mockListMatches.mockResolvedValue({ data: null, error: { status: 403 } });

        const { result } = renderHook(() => useSearchFilterMatchedProducts("filter-1"), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
    });

    it("stops when the endpoint omits the terminal cursor", async () => {
        mockListMatches.mockResolvedValue({
            data: { ...mockPageData, searchAfter: undefined },
            error: null,
        });

        const { result } = renderHook(() => useSearchFilterMatchedProducts("filter-1"), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.hasNextPage).toBe(false);
    });
});
