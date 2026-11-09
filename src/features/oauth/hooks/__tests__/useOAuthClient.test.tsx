import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useOAuthClient } from "../useOAuthClient.ts";

const metadata = vi.hoisted(() => vi.fn());
const documentMetadata = vi.hoisted(() => vi.fn());
vi.mock("@/features/oauth/api/oauthConsentMetadata.ts", () => ({
    getOAuthConsentClient: metadata,
    getOAuthMetadataDocumentConsentClient: documentMetadata,
}));

describe("useOAuthClient", () => {
    let client: QueryClient;
    beforeEach(() => {
        metadata.mockReset();
        documentMetadata.mockReset();
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

    it("reads a registered client by its ID alone", async () => {
        metadata.mockResolvedValue({ kind: "registered", clientId: "oc_test" });
        const { result } = renderHook(
            () => useOAuthClient("oc_test", "https://client.example/callback"),
            { wrapper },
        );
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(metadata).toHaveBeenCalledWith("oc_test");
        expect(documentMetadata).not.toHaveBeenCalled();
    });

    it("reads a URL client's metadata for the requested callback", async () => {
        const clientId = "https://claude.ai/oauth/claude-code-client-metadata";
        const agent = { kind: "metadataDocument", clientId };
        documentMetadata.mockResolvedValue(agent);
        const { result } = renderHook(
            () => useOAuthClient(clientId, "http://localhost:53682/callback"),
            { wrapper },
        );
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual(agent);
        expect(documentMetadata).toHaveBeenCalledWith(clientId, "http://localhost:53682/callback");
        expect(metadata).not.toHaveBeenCalled();
    });

    it("never reads a URL client without the requested callback", async () => {
        const { result } = renderHook(
            () => useOAuthClient("https://claude.ai/oauth/claude-code-client-metadata"),
            { wrapper },
        );
        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(documentMetadata).not.toHaveBeenCalled();
        expect(metadata).not.toHaveBeenCalled();
    });
});
