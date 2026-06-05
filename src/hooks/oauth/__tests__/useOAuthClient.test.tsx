import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useOAuthClient } from "../useOAuthClient.ts";

const mockGetOAuthClient = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn());

vi.mock("@/client", () => ({
    getOAuthClient: mockGetOAuthClient,
}));

vi.mock("@/hooks/common/useApiError.ts", () => ({
    useApiError: () => ({
        getErrorMessage: mockGetErrorMessage,
    }),
}));

const clientId = "01970f22-2bf0-7000-8000-000000000010";

const apiClient = {
    client_id: clientId,
    client_name: "Test Partner App",
    tos_uri: "https://client.example/terms",
    policy_uri: "https://client.example/privacy",
    client_uri: "https://client.example",
    logo_uri: "https://client.example/logo.png",
    redirect_uris: ["https://client.example/callback"],
    scope: ["products:write", "shops:manage"],
};

describe("useOAuthClient", () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        });
        mockGetErrorMessage.mockReturnValue("OAuth client request failed");
    });

    it("does not fetch when no client id is provided", () => {
        const { result } = renderHook(() => useOAuthClient(undefined), {
            wrapper: createWrapper(queryClient),
        });

        expect(result.current.isFetching).toBe(false);
        expect(result.current.data).toBeUndefined();
        expect(mockGetOAuthClient).not.toHaveBeenCalled();
    });

    it("fetches and maps OAuth client metadata", async () => {
        mockGetOAuthClient.mockResolvedValue({
            data: apiClient,
            error: null,
        });

        const { result } = renderHook(() => useOAuthClient(clientId), {
            wrapper: createWrapper(queryClient),
        });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(mockGetOAuthClient).toHaveBeenCalledWith({
            path: { clientId },
        });
        expect(result.current.data).toEqual({
            clientId,
            clientName: "Test Partner App",
            tosUri: "https://client.example/terms",
            policyUri: "https://client.example/privacy",
            clientUri: "https://client.example",
            logoUri: "https://client.example/logo.png",
            redirectUris: ["https://client.example/callback"],
            scopes: ["products:write", "shops:manage"],
        });
    });

    it("maps API errors to hook errors", async () => {
        const apiError = {
            status: 401,
            title: "Unauthorized",
            error: "UNAUTHORIZED",
        };
        mockGetOAuthClient.mockResolvedValue({
            data: undefined,
            error: apiError,
        });

        const { result } = renderHook(() => useOAuthClient(clientId), {
            wrapper: createWrapper(queryClient),
        });

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });

        expect(mockGetErrorMessage).toHaveBeenCalledWith({
            status: 401,
            title: "Unauthorized",
            error: "UNAUTHORIZED",
            detail: undefined,
            source: undefined,
        });
        expect(result.current.error).toEqual(new Error("OAuth client request failed"));
    });
});

function createWrapper(queryClient: QueryClient) {
    return ({ children }: { readonly children: ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children);
}
