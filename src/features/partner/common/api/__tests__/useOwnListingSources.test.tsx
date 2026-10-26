import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearViewerScopedQueries } from "@/features/authentication/lib/clearViewerScopedQueries.ts";
import { useOwnListingSources, OWN_LISTING_SOURCES_QUERY_KEY } from "../useOwnListingSources.ts";

const getSources = vi.hoisted(() => vi.fn());
vi.mock("@/client", () => ({ getMyListingSources: getSources }));
vi.mock("@/hooks/common/useApiError.ts", () => ({
    useApiError: () => ({ getErrorMessage: () => "Access unavailable" }),
}));
const source = { listingSourceId: "ls_granted", listingSourceSlugId: "dealer", name: "Dealer" };
const second = { listingSourceId: "ls_second", listingSourceSlugId: "second", name: "B" };
const lastPageSource = { listingSourceId: "ls_last", listingSourceSlugId: "last", name: "Z" };
// Cursors are opaque: sent back byte for byte, never decoded or normalised.
const cursor = "eyJhZnRlciI6IkRlYWxlciJ9+/=%20~";
const failure = {
    error: { status: 400, title: "Bad Request", error: "BAD_QUERY_PARAMETER_VALUE" },
};

function request(after?: string) {
    return { query: { size: 100, after }, cache: "no-store", signal: expect.any(AbortSignal) };
}

describe("shared own listing sources", () => {
    let client: QueryClient;
    beforeEach(() => {
        vi.clearAllMocks();
        client = new QueryClient();
    });
    function wrapper({ children }: { children: ReactNode }) {
        return createElement(QueryClientProvider, { client }, children);
    }

    it("maps only the three reference fields and never requests details", async () => {
        getSources.mockResolvedValue({
            data: { items: [{ ...source, operator: { private: true } }] },
        });
        const { result } = renderHook(() => useOwnListingSources(true), { wrapper });
        await waitFor(() => expect(result.current.isPending).toBe(false));
        expect(result.current.sources).toEqual([source]);
        expect(result.current.hasMore).toBe(false);
        expect(getSources).toHaveBeenCalledOnce();
        expect(getSources).toHaveBeenCalledWith(request());
    });

    it("requests a later page only on demand and reaches the last page", async () => {
        getSources
            .mockResolvedValueOnce({ data: { items: [source], next: cursor } })
            .mockResolvedValueOnce({ data: { items: [second], next: "cursor-2" } })
            .mockResolvedValueOnce({ data: { items: [lastPageSource] } });
        const { result } = renderHook(() => useOwnListingSources(true), { wrapper });
        await waitFor(() => expect(result.current.canLoadMore).toBe(true));
        expect(result.current.sources).toEqual([source]);
        expect(getSources).toHaveBeenCalledOnce();

        act(() => result.current.loadMore());
        await waitFor(() => expect(result.current.sources).toHaveLength(2));
        expect(getSources).toHaveBeenNthCalledWith(2, request(cursor));
        expect(result.current.hasMore).toBe(true);

        await waitFor(() => expect(result.current.canLoadMore).toBe(true));
        act(() => result.current.loadMore());
        await waitFor(() => expect(result.current.hasMore).toBe(false));
        expect(getSources).toHaveBeenNthCalledWith(3, request("cursor-2"));
        expect(result.current.sources).toEqual([source, second, lastPageSource]);
        expect(result.current.canLoadMore).toBe(false);
    });

    it("keeps distinct sources with equal names and one entry per repeated ID", async () => {
        const namesake = { ...second, name: source.name };
        getSources
            .mockResolvedValueOnce({ data: { items: [source, namesake], next: cursor } })
            .mockResolvedValueOnce({ data: { items: [{ ...source, name: "Renamed" }] } });
        const { result } = renderHook(() => useOwnListingSources(true), { wrapper });
        await waitFor(() => expect(result.current.canLoadMore).toBe(true));
        act(() => result.current.loadMore());
        await waitFor(() => expect(result.current.hasMore).toBe(false));
        expect(result.current.sources).toEqual([source, namesake]);
    });

    it("keeps the loaded pages when the next page fails and lets it be requested again", async () => {
        getSources
            .mockResolvedValueOnce({ data: { items: [source], next: cursor } })
            .mockResolvedValueOnce(failure)
            .mockResolvedValueOnce({ data: { items: [second] } });
        const { result } = renderHook(() => useOwnListingSources(true), { wrapper });
        await waitFor(() => expect(result.current.canLoadMore).toBe(true));

        act(() => result.current.loadMore());
        await waitFor(() => expect(result.current.isLoadMoreError).toBe(true));
        expect(result.current.isError).toBe(false);
        expect(result.current.sources).toEqual([source]);
        expect(result.current.hasMore).toBe(true);
        expect(getSources).toHaveBeenCalledTimes(2);

        act(() => result.current.loadMore());
        await waitFor(() => expect(result.current.hasMore).toBe(false));
        expect(getSources).toHaveBeenNthCalledWith(3, request(cursor));
        expect(result.current.isLoadMoreError).toBe(false);
        expect(result.current.sources).toEqual([source, second]);
    });

    it("withholds every loaded page when a refresh fails", async () => {
        getSources
            .mockResolvedValueOnce({ data: { items: [source], next: cursor } })
            .mockResolvedValueOnce({ data: { items: [second] } })
            .mockResolvedValueOnce({ data: { items: [source], next: "fresh-cursor" } })
            .mockResolvedValueOnce(failure);
        const { result } = renderHook(() => useOwnListingSources(true), { wrapper });
        await waitFor(() => expect(result.current.canLoadMore).toBe(true));
        act(() => result.current.loadMore());
        await waitFor(() => expect(result.current.sources).toEqual([source, second]));

        act(() => result.current.retry());
        await waitFor(() => expect(result.current.isError).toBe(true));
        // The refresh walks the loaded pages again with the fresh continuation.
        expect(getSources).toHaveBeenNthCalledWith(3, request());
        expect(getSources).toHaveBeenNthCalledWith(4, request("fresh-cursor"));
        expect(result.current.sources).toEqual([]);
        expect(result.current.hasMore).toBe(false);
        expect(result.current.canLoadMore).toBe(false);
    });

    it("replaces previously granted sources with an empty list on revocation", async () => {
        getSources
            .mockResolvedValueOnce({ data: { items: [source] } })
            .mockResolvedValueOnce({ data: { items: [] } });
        const { result } = renderHook(() => useOwnListingSources(true), { wrapper });
        await waitFor(() => expect(result.current.sources).toEqual([source]));
        act(() => result.current.retry());
        await waitFor(() => expect(result.current.sources).toEqual([]));
        expect(result.current.isError).toBe(false);
        expect(result.current.hasMore).toBe(false);
    });

    it("does not fetch for a disabled consumer", () => {
        const { result } = renderHook(() => useOwnListingSources(false), { wrapper });
        expect(getSources).not.toHaveBeenCalled();
        expect(result.current.sources).toEqual([]);
        expect(result.current.hasMore).toBe(false);
    });

    it("reports denied access without retrying or calling an admin endpoint", async () => {
        getSources.mockResolvedValue({
            error: { status: 403, title: "Forbidden", error: "FORBIDDEN" },
        });
        const { result } = renderHook(() => useOwnListingSources(true), { wrapper });
        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.sources).toEqual([]);
        expect(getSources).toHaveBeenCalledOnce();
    });

    it("cancels a pending read and releases source data when unmounted", async () => {
        getSources.mockReturnValueOnce(new Promise(() => {}));
        const { unmount } = renderHook(() => useOwnListingSources(true), { wrapper });
        await waitFor(() => expect(getSources).toHaveBeenCalledOnce());
        const { signal } = getSources.mock.calls[0][0];
        unmount();
        await waitFor(() => expect(signal.aborted).toBe(true));
        await waitFor(() =>
            expect(client.getQueryData(OWN_LISTING_SOURCES_QUERY_KEY)).toBeUndefined(),
        );
    });

    it("never fills the next viewer's pages with a late page of the previous viewer", async () => {
        let resolveLatePage: (value: unknown) => void = () => {};
        getSources
            .mockResolvedValueOnce({ data: { items: [source], next: cursor } })
            .mockReturnValueOnce(new Promise((resolve) => (resolveLatePage = resolve)))
            .mockResolvedValueOnce({ data: { items: [second] } });
        const { result, rerender } = renderHook(({ enabled }) => useOwnListingSources(enabled), {
            wrapper,
            initialProps: { enabled: true },
        });
        await waitFor(() => expect(result.current.canLoadMore).toBe(true));
        act(() => result.current.loadMore());
        await waitFor(() => expect(result.current.isLoadingMore).toBe(true));
        const { signal } = getSources.mock.calls[1][0];

        act(() => clearViewerScopedQueries(client));
        expect(signal.aborted).toBe(true);
        rerender({ enabled: false });
        rerender({ enabled: true });
        await waitFor(() => expect(result.current.sources).toEqual([second]));
        expect(getSources).toHaveBeenNthCalledWith(3, request());

        await act(async () => resolveLatePage({ data: { items: [lastPageSource] } }));
        expect(result.current.sources).toEqual([second]);
        expect(result.current.hasMore).toBe(false);
    });
});
