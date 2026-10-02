import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useOAuthClient } from "../useOAuthClient.ts";

const metadata = vi.hoisted(() => vi.fn());
vi.mock("@/features/oauth/api/oauthConsentMetadata.ts", () => ({
    getOAuthConsentClient: metadata,
}));

describe("useOAuthClient", () => {
    let client: QueryClient;
    beforeEach(() => {
        metadata.mockReset();
        client = new QueryClient();
    });
    function wrapper({ children }: { children: ReactNode }) {
        return createElement(QueryClientProvider, { client }, children);
    }

    it("does not fetch without a client identifier", () => {
        const { result } = renderHook(() => useOAuthClient(undefined), { wrapper });
        expect(result.current.isFetching).toBe(false);
        expect(metadata).not.toHaveBeenCalled();
    });

    it("makes mapped metadata available", async () => {
        const client = { clientId: "oc_test", clientName: "Test", scopes: [], redirectUris: [] };
        metadata.mockResolvedValue(client);
        const { result } = renderHook(() => useOAuthClient("oc_test"), { wrapper });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual(client);
        expect(metadata).toHaveBeenCalledWith("oc_test");
    });

    it("exposes failure without retrying or supplying fallback metadata", async () => {
        metadata.mockRejectedValue(new Error("Unavailable"));
        const { result } = renderHook(() => useOAuthClient("oc_test"), { wrapper });
        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.data).toBeUndefined();
        expect(metadata).toHaveBeenCalledTimes(1);
    });
});
