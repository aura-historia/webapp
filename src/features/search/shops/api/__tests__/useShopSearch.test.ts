import { useShopSearch } from "../useShopSearch.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { searchSources, getErrorMessage } = vi.hoisted(() => ({
    searchSources: vi.fn(),
    getErrorMessage: vi.fn(),
}));
vi.mock("@/client", () => ({ searchPublicListingSources: searchSources }));
vi.mock("@/hooks/common/useApiError.ts", () => ({ useApiError: () => ({ getErrorMessage }) }));
vi.mock("@/data/internal/hooks/ApiError.ts", () => ({
    mapToInternalApiError: (error: unknown) => error,
}));
vi.mock("@/env.ts", () => ({ env: { VITE_FEATURE_SEARCH_ENABLED: true } }));

let queryClient: QueryClient;
function wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
}

beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    searchSources.mockResolvedValue({ data: { items: [], size: 0 } });
    getErrorMessage.mockReturnValue("Translated failure");
});

describe("public listing source search", () => {
    it("browses all sources when the query is empty", async () => {
        const { result } = renderHook(() => useShopSearch({ q: "" }), { wrapper });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(searchSources).toHaveBeenCalledWith({ query: { size: 30, searchAfter: undefined } });
    });
    it("sends even short query text without legacy filters or sorting", async () => {
        const { result } = renderHook(() => useShopSearch({ q: "ab" }), { wrapper });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(searchSources).toHaveBeenCalledWith({
            query: { query: "ab", size: 30, searchAfter: undefined },
        });
    });
    it("maps public source fields and carries the opaque cursor to the next request", async () => {
        searchSources.mockResolvedValueOnce({
            data: {
                items: [
                    {
                        listingSourceId: "source-1",
                        listingSourceSlugId: "provider-one",
                        name: "Provider One",
                        operator: { name: "Operator One" },
                        url: "https://example.com",
                    },
                ],
                size: 1,
                searchAfter: "opaque/source/cursor",
            },
        });
        const { result } = renderHook(() => useShopSearch({ q: "provider" }), { wrapper });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data?.pages[0].sources[0]).toEqual({
            listingSourceId: "source-1",
            slugId: "provider-one",
            name: "Provider One",
            operatorName: "Operator One",
            url: "https://example.com",
            image: undefined,
        });
        expect(result.current.hasNextPage).toBe(true);
        await act(async () => {
            await result.current.fetchNextPage();
        });
        expect(searchSources).toHaveBeenLastCalledWith({
            query: { query: "provider", size: 30, searchAfter: "opaque/source/cursor" },
        });
        await waitFor(() => expect(result.current.hasNextPage).toBe(false));
    });
    it("reports a translated API error", async () => {
        searchSources.mockResolvedValueOnce({ error: { message: "failure" } });
        const { result } = renderHook(() => useShopSearch({ q: "provider" }), { wrapper });
        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error?.message).toBe("Translated failure");
    });
});
