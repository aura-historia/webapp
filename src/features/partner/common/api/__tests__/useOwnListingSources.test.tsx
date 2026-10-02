import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useOwnListingSources, OWN_LISTING_SOURCES_QUERY_KEY } from "../useOwnListingSources.ts";
import { usePartnerShops } from "../usePartnerShops.ts";

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
        getSources.mockResolvedValue({ data: [{ ...source, operator: { private: true } }] });
        const { result } = renderHook(() => useOwnListingSources(true), { wrapper });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual([source]);
        expect(getSources).toHaveBeenCalledOnce();
        expect(getSources).toHaveBeenCalledWith({
            cache: "no-store",
            signal: expect.any(AbortSignal),
        });
    });
    it("replaces previously granted sources with an empty list on revocation", async () => {
        getSources.mockResolvedValueOnce({ data: [source] }).mockResolvedValueOnce({ data: [] });
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
        getSources.mockResolvedValue({ data: [source] });
        const { result, unmount } = renderHook(() => useOwnListingSources(true), { wrapper });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        unmount();
        await waitFor(() =>
            expect(client.getQueryData(OWN_LISTING_SOURCES_QUERY_KEY)).toBeUndefined(),
        );
    });
    it("adapts canonical IDs for the remaining custom-integration consumer", async () => {
        getSources.mockResolvedValue({ data: [source] });
        const { result } = renderHook(() => usePartnerShops(true), { wrapper });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual([
            { shopId: "ls_granted", shopSlugId: "dealer", name: "Dealer" },
        ]);
    });
    it("withholds custom-integration choices after a denied refresh", async () => {
        getSources.mockResolvedValueOnce({ data: [source] }).mockResolvedValueOnce({
            error: { status: 403, title: "Forbidden", error: "FORBIDDEN" },
        });
        const { result } = renderHook(() => usePartnerShops(true), { wrapper });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        await act(async () => {
            await result.current.refetch();
        });
        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.data).toBeUndefined();
    });
    it("withholds cached integration choices when disabled", async () => {
        getSources.mockResolvedValue({ data: [source] });
        const { result, rerender } = renderHook(({ enabled }) => usePartnerShops(enabled), {
            wrapper,
            initialProps: { enabled: true },
        });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        rerender({ enabled: false });
        expect(result.current.data).toBeUndefined();
    });
});
