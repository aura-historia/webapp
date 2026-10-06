import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getWatchlistQueryKey, useWatchlist } from "../useWatchlist.ts";

const mockGetWatchlist = vi.hoisted(() => vi.fn());

vi.mock("@/client", () => ({ getWatchlistProductListings: mockGetWatchlist }));
vi.mock("@/hooks/common/useApiError.ts", () => ({
    useApiError: () => ({ getErrorMessage: (error: Error) => error.message }),
}));
vi.mock("react-i18next", () => ({
    useTranslation: () => ({ i18n: { language: "en" } }),
}));
vi.mock("@/features/preferences/hooks/useUserPreferences.tsx", () => ({
    useUserPreferences: () => ({ preferences: { currency: "EUR" } }),
}));
vi.mock("@/features/authentication/hooks/useResolvedAuth.ts", () => ({
    useResolvedAuth: () => ({ user: { userId: "user-1" }, isLoading: false }),
}));

describe("useWatchlist", () => {
    let queryClient: QueryClient;
    const wrapper = ({ children }: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children);
    const cursor: [string, string] = ["2026-09-29T10:00:00Z", "listing-2"];

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
        });
        mockGetWatchlist.mockResolvedValue({
            data: { items: [], size: 0, searchAfter: cursor },
            error: null,
        });
    });

    it("serializes the tuple cursor and stops when the server repeats it", async () => {
        const { result } = renderHook(() => useWatchlist(), { wrapper });

        await waitFor(() => expect(result.current.data?.pages).toHaveLength(1));
        await result.current.fetchNextPage();

        await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));
        expect(mockGetWatchlist).toHaveBeenLastCalledWith({
            query: {
                language: "en",
                currency: "EUR",
                searchAfter: JSON.stringify(cursor),
                size: 20,
            },
        });
        expect(result.current.hasNextPage).toBe(false);
    });

    it("partitions authenticated watchlist pages by account", () => {
        expect(getWatchlistQueryKey("user-1", "en", "EUR")).not.toEqual(
            getWatchlistQueryKey("user-2", "en", "EUR"),
        );
        expect(getWatchlistQueryKey(undefined, "en", "EUR")).not.toEqual(
            getWatchlistQueryKey("user-1", "en", "EUR"),
        );
    });
});
