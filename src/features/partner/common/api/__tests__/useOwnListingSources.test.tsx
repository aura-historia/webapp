import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useOwnListingSources, OWN_LISTING_SOURCES_QUERY_KEY } from "../useOwnListingSources.ts";

const getSources = vi.hoisted(() => vi.fn());
vi.mock("@/client", () => ({ getMyListingSources: getSources }));
vi.mock("@/hooks/common/useApiError.ts", () => ({
    useApiError: () => ({ getErrorMessage: () => "Access unavailable" }),
}));
const source = { listingSourceId: "ls_granted", listingSourceSlugId: "dealer", name: "Dealer" };

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
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual([source]);
        expect(getSources).toHaveBeenCalledOnce();
        expect(getSources).toHaveBeenCalledWith({
            query: { size: 100, after: undefined },
            cache: "no-store",
            signal: expect.any(AbortSignal),
        });
    });
    it("follows every continuation and combines the pages in order", async () => {
        const second = { listingSourceId: "ls_second", listingSourceSlugId: "second", name: "B" };
        getSources
            .mockResolvedValueOnce({ data: { items: [source], next: "cursor-1" } })
            .mockResolvedValueOnce({ data: { items: [second] } });
        const { result } = renderHook(() => useOwnListingSources(true), { wrapper });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual([source, second]);
        expect(getSources).toHaveBeenNthCalledWith(2, {
            query: { size: 100, after: "cursor-1" },
            cache: "no-store",
            signal: expect.any(AbortSignal),
        });
    });
    it("fails instead of returning a partial list when a later page fails", async () => {
        getSources
            .mockResolvedValueOnce({ data: { items: [source], next: "cursor-1" } })
            .mockResolvedValueOnce({
                error: { status: 400, title: "Bad Request", error: "BAD_QUERY_PARAMETER_VALUE" },
            });
        const { result } = renderHook(() => useOwnListingSources(true), { wrapper });
        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.data).toBeUndefined();
    });
    it("fails when a continuation repeats", async () => {
        getSources.mockResolvedValue({ data: { items: [source], next: "cursor-1" } });
        const { result } = renderHook(() => useOwnListingSources(true), { wrapper });
        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(getSources).toHaveBeenCalledTimes(2);
    });
    it("replaces previously granted sources with an empty list on revocation", async () => {
        getSources
            .mockResolvedValueOnce({ data: { items: [source] } })
            .mockResolvedValueOnce({ data: { items: [] } });
        const { result } = renderHook(() => useOwnListingSources(true), { wrapper });
        await waitFor(() => expect(result.current.data).toEqual([source]));
        await act(async () => {
            await result.current.refetch();
        });
        await waitFor(() => expect(result.current.data).toEqual([]));
    });
    it("does not fetch for a disabled consumer", () => {
        renderHook(() => useOwnListingSources(false), { wrapper });
        expect(getSources).not.toHaveBeenCalled();
    });
    it("reports denied access without retrying or calling an admin endpoint", async () => {
        getSources.mockResolvedValue({
            error: { status: 403, title: "Forbidden", error: "FORBIDDEN" },
        });
        const { result } = renderHook(() => useOwnListingSources(true), { wrapper });
        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.data).toBeUndefined();
        expect(result.current.error?.message).toBe("Access unavailable");
        expect(getSources).toHaveBeenCalledOnce();
    });
    it("releases inactive source data instead of persisting grants", async () => {
        getSources.mockResolvedValue({ data: { items: [source] } });
        const { result, unmount } = renderHook(() => useOwnListingSources(true), { wrapper });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        unmount();
        await waitFor(() =>
            expect(client.getQueryData(OWN_LISTING_SOURCES_QUERY_KEY)).toBeUndefined(),
        );
    });
});
