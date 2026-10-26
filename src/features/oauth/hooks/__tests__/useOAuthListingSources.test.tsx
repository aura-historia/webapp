import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useOwnListingSources } from "@/features/partner/common/api/useOwnListingSources.ts";
import { useOAuthListingSources } from "../useOAuthListingSources.ts";

const getSources = vi.hoisted(() => vi.fn());
vi.mock("@/client", () => ({ getMyListingSources: getSources }));
vi.mock("@/hooks/common/useApiError.ts", () => ({
    useApiError: () => ({ getErrorMessage: () => "Access unavailable" }),
}));
const source = { listingSourceId: "ls_test", listingSourceSlugId: "public-slug", name: "Dealer" };

describe("useOAuthListingSources", () => {
    let client: QueryClient;
    beforeEach(() => {
        vi.clearAllMocks();
        client = new QueryClient();
    });
    function wrapper({ children }: { children: ReactNode }) {
        return createElement(QueryClientProvider, { client }, children);
    }
    it("maps granted source DTOs before supplying the UI", async () => {
        getSources.mockResolvedValue({ data: { items: [source] } });
        const { result } = renderHook(() => useOAuthListingSources(true), { wrapper });
        await waitFor(() => expect(result.current.isPending).toBe(false));
        expect(result.current.sources).toEqual([source]);
        expect(getSources).toHaveBeenCalledWith({
            query: { size: 100, after: undefined },
            cache: "no-store",
            signal: expect.any(AbortSignal),
        });
    });
    it("shares the partner views' source pages instead of keeping its own cache", async () => {
        const later = { listingSourceId: "ls_later", listingSourceSlugId: "later", name: "Later" };
        getSources
            .mockResolvedValueOnce({ data: { items: [source], next: "cursor-1" } })
            .mockResolvedValueOnce({ data: { items: [later] } });
        const { result } = renderHook(
            () => ({ oauth: useOAuthListingSources(true), partner: useOwnListingSources(true) }),
            { wrapper },
        );
        await waitFor(() => expect(result.current.oauth.canLoadMore).toBe(true));
        act(() => result.current.oauth.loadMore());
        await waitFor(() => expect(result.current.partner.sources).toEqual([source, later]));
        expect(getSources).toHaveBeenCalledTimes(2);
    });
    it("keeps an empty grant list empty", async () => {
        getSources.mockResolvedValue({ data: { items: [] } });
        const { result } = renderHook(() => useOAuthListingSources(true), { wrapper });
        await waitFor(() => expect(result.current.isPending).toBe(false));
        expect(result.current.sources).toEqual([]);
        expect(result.current.hasMore).toBe(false);
    });
    it("does not fetch when source selection is disabled", () => {
        renderHook(() => useOAuthListingSources(false), { wrapper });
        expect(getSources).not.toHaveBeenCalled();
    });
    it("does not expose source data on denied access", async () => {
        getSources.mockResolvedValue({
            error: { status: 403, title: "Forbidden", error: "FORBIDDEN" },
        });
        const { result } = renderHook(() => useOAuthListingSources(true), { wrapper });
        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.sources).toEqual([]);
    });
});
