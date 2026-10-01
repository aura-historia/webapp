import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { useOAuthClient } from "../useOAuthClient.ts";

describe("useOAuthClient contract gate", () => {
    function wrapper({ children }: { children: ReactNode }) {
        return createElement(QueryClientProvider, { client: new QueryClient() }, children);
    }

    it("does not fetch without a client identifier", () => {
        const { result } = renderHook(() => useOAuthClient(undefined), { wrapper });
        expect(result.current.isFetching).toBe(false);
    });

    it("fails closed without contacting an admin endpoint or fetching untrusted metadata", async () => {
        const fetch = vi.spyOn(globalThis, "fetch");
        const { result } = renderHook(() => useOAuthClient("oc_test"), { wrapper });
        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.data).toBeUndefined();
        expect(fetch).not.toHaveBeenCalled();
        fetch.mockRestore();
    });
});
