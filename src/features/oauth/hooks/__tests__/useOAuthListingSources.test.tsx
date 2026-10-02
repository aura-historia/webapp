import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useOAuthListingSources } from "../useOAuthListingSources.ts";

const getSources = vi.hoisted(() => vi.fn());
vi.mock("@/client", () => ({ getMyListingSources: getSources }));
vi.mock("@/hooks/common/useApiError.ts", () => ({
    useApiError: () => ({ getErrorMessage: () => "Access unavailable" }),
}));

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
        getSources.mockResolvedValue({
            data: [
                { listingSourceId: "ls_test", listingSourceSlugId: "public-slug", name: "Dealer" },
            ],
        });
        const { result } = renderHook(() => useOAuthListingSources(true), { wrapper });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual([{ listingSourceId: "ls_test", name: "Dealer" }]);
        expect(getSources).toHaveBeenCalledWith({ cache: "no-store" });
    });
    it("keeps an empty grant list empty", async () => {
        getSources.mockResolvedValue({ data: [] });
        const { result } = renderHook(() => useOAuthListingSources(true), { wrapper });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual([]);
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
        expect(result.current.data).toBeUndefined();
    });
});
