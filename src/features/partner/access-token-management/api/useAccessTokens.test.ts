import { createElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    ACCESS_TOKENS_QUERY_KEY,
    useAccessTokens,
    useCreateAccessToken,
    useDeleteAccessToken,
    useDeleteAllAccessTokens,
    useDisconnectConnectedApp,
    useOwnCredentials,
    useUpdateAccessToken,
} from "@/features/partner/access-token-management/api/useAccessTokens.ts";
import type { AccessToken } from "@/data/internal/access-tokens/AccessToken.ts";
import type { ConnectedApp, OwnCredentials } from "@/data/internal/access-tokens/OwnCredentials.ts";

const mockGetMyAccessTokens = vi.hoisted(() => vi.fn());
const mockPostMyAccessToken = vi.hoisted(() => vi.fn());
const mockPatchMyAccessToken = vi.hoisted(() => vi.fn());
const mockDeleteMyAccessToken = vi.hoisted(() => vi.fn());
const mockDisconnectMyOAuthClient = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn());

vi.mock("@/client", () => ({
    getMyAccessTokens: mockGetMyAccessTokens,
    postMyAccessToken: mockPostMyAccessToken,
    patchMyAccessToken: mockPatchMyAccessToken,
    deleteMyAccessToken: mockDeleteMyAccessToken,
    disconnectMyOAuthClient: mockDisconnectMyOAuthClient,
}));

vi.mock("@/hooks/common/useApiError.ts", () => ({
    useApiError: () => ({
        getErrorMessage: mockGetErrorMessage,
    }),
}));

vi.mock("@/data/internal/hooks/ApiError.ts", () => ({
    mapToInternalApiError: (error: unknown) => error,
}));

vi.mock("sonner", () => ({
    toast: {
        error: vi.fn(),
    },
}));

function connectedApp(clientId: string, name: string): ConnectedApp {
    return {
        client: { clientId, name, kind: "registered", host: "example.com" },
        origin: "OAuth",
        scopes: [],
        connection: null,
        tokens: [{ id: `at_${name}`, scopes: [], expiresAt: null }],
    };
}

const SHOPIFY_APP = connectedApp("oc_shopify", "Shopify");
const WOOCOMMERCE_APP = connectedApp("oc_woocommerce", "WooCommerce");

function credentials(
    personalTokens: Array<Partial<AccessToken> & { id: string }>,
    connectedApps: ConnectedApp[] = [SHOPIFY_APP],
): OwnCredentials {
    return {
        personalTokens: personalTokens.map((token) => ({
            name: token.id,
            scopes: [],
            expiresAt: null,
            ...token,
        })),
        connectedApps,
    };
}

describe("useAccessTokens", () => {
    let queryClient: QueryClient;

    const createWrapper =
        () =>
        ({ children }: { children: React.ReactNode }) =>
            createElement(QueryClientProvider, { client: queryClient }, children);

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });
    });

    it("loads and maps the authenticated user's access tokens in backend order, without agent connections", async () => {
        mockGetMyAccessTokens.mockResolvedValue({
            data: [
                {
                    userId: "user-1",
                    accessTokenId: "newer-token",
                    name: "Newer token",
                    scopes: ["product-listings:write"],
                    origin: "User",
                    expires: "2026-08-01T12:00:00Z",
                },
                {
                    userId: "user-1",
                    connectionId: "ocn_agent",
                    name: "Claude Code",
                    scopes: ["watchlist:read"],
                    origin: "OAuthMetadataDocument",
                    created: "2026-11-01T09:00:00Z",
                    lastUsed: "2026-11-06T12:00:00Z",
                },
                {
                    userId: "user-1",
                    accessTokenId: "older-token",
                    name: "Older token",
                    scopes: [],
                    origin: "User",
                },
            ],
            error: null,
        });

        const { result } = renderHook(() => useAccessTokens(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(mockGetMyAccessTokens).toHaveBeenCalledOnce();
        expect(result.current.data?.map((token) => token.id)).toEqual([
            "newer-token",
            "older-token",
        ]);
        expect(result.current.data).toEqual([
            {
                id: "newer-token",
                name: "Newer token",
                scopes: ["product-listings:write"],
                expiresAt: new Date("2026-08-01T12:00:00Z"),
            },
            { id: "older-token", name: "Older token", scopes: [], expiresAt: null },
        ]);
    });

    it("surfaces mapped API errors", async () => {
        mockGetMyAccessTokens.mockResolvedValue({
            data: null,
            error: { message: "Load failed" },
        });
        mockGetErrorMessage.mockReturnValue("Load failed");

        const { result } = renderHook(() => useAccessTokens(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isError).toBe(true));

        expect(result.current.error?.message).toBe("Load failed");
    });

    it("creates an access token and invalidates the list", async () => {
        const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
        mockPostMyAccessToken.mockResolvedValue({
            data: {
                userId: "user-1",
                accessTokenId: "created-token",
                accessToken: "aurahistoria_plaintext_token",
            },
            error: null,
        });
        const expiresAt = new Date("2026-08-01T10:00:00.000Z");

        const { result } = renderHook(() => useCreateAccessToken(), {
            wrapper: createWrapper(),
        });
        result.current.mutate({
            name: "Product sync",
            scopes: ["product-listings:write"],
            expiresAt,
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(mockPostMyAccessToken).toHaveBeenCalledWith({
            body: {
                name: "Product sync",
                scopes: ["product-listings:write"],
                expires: "2026-08-01T10:00:00.000Z",
            },
        });
        expect(result.current.data).toEqual({
            id: "created-token",
            plaintextToken: "aurahistoria_plaintext_token",
        });
        expect(invalidateQueries).toHaveBeenCalledWith({
            queryKey: ACCESS_TOKENS_QUERY_KEY,
        });
        expect(queryClient.getQueryData(ACCESS_TOKENS_QUERY_KEY)).toBeUndefined();
        result.current.reset();
        await waitFor(() => expect(queryClient.getMutationCache().getAll()).toHaveLength(0));
    });

    it("sends an explicit empty scope set and omits an absent expiry", async () => {
        mockPostMyAccessToken.mockResolvedValue({
            data: {
                userId: "user-1",
                accessTokenId: "created-token",
                accessToken: "aurahistoria_plaintext_token",
            },
            error: null,
        });

        const { result } = renderHook(() => useCreateAccessToken(), {
            wrapper: createWrapper(),
        });
        result.current.mutate({
            name: "Unscoped token",
            scopes: [],
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(mockPostMyAccessToken).toHaveBeenCalledWith({
            body: {
                name: "Unscoped token",
                scopes: [],
            },
        });
    });

    it("updates editable metadata and replaces the cached token", async () => {
        queryClient.setQueryData(
            ACCESS_TOKENS_QUERY_KEY,
            credentials([{ id: "token-123", name: "Old name" }, { id: "token-other" }]),
        );
        mockPatchMyAccessToken.mockResolvedValue({
            data: {
                userId: "user-1",
                accessTokenId: "token-123",
                name: "Product sync",
                scopes: ["product-listings:write"],
                origin: "User",
                expires: "2026-08-01T10:00:00.000Z",
            },
            error: null,
        });
        const expiresAt = new Date("2026-08-01T10:00:00.000Z");

        const { result } = renderHook(() => useUpdateAccessToken(), {
            wrapper: createWrapper(),
        });
        result.current.mutate({
            id: "token-123",
            name: "Product sync",
            scopes: ["product-listings:write"],
            expiresAt,
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(mockPatchMyAccessToken).toHaveBeenCalledWith({
            body: {
                accessTokenId: "token-123",
                name: "Product sync",
                scopes: ["product-listings:write"],
                expires: "2026-08-01T10:00:00.000Z",
            },
        });
        expect(queryClient.getQueryData<OwnCredentials>(ACCESS_TOKENS_QUERY_KEY)).toEqual({
            personalTokens: [
                {
                    id: "token-123",
                    name: "Product sync",
                    scopes: ["product-listings:write"],
                    expiresAt: new Date("2026-08-01T10:00:00.000Z"),
                },
                { id: "token-other", name: "token-other", scopes: [], expiresAt: null },
            ],
            connectedApps: [SHOPIFY_APP],
        });
    });

    it("deletes one access token and removes it from the cache", async () => {
        queryClient.setQueryData(
            ACCESS_TOKENS_QUERY_KEY,
            credentials([{ id: "token-1" }, { id: "token-2" }]),
        );
        mockDeleteMyAccessToken.mockResolvedValue({ data: undefined, error: null });

        const { result } = renderHook(() => useDeleteAccessToken(), {
            wrapper: createWrapper(),
        });
        result.current.mutate("token-1");

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(mockDeleteMyAccessToken).toHaveBeenCalledWith({
            path: { accessTokenId: "token-1" },
        });
        expect(queryClient.getQueryData<OwnCredentials>(ACCESS_TOKENS_QUERY_KEY)).toEqual(
            credentials([{ id: "token-2" }]),
        );
    });

    it("deletes every supplied access token and clears the personal tokens, keeping connected apps", async () => {
        queryClient.setQueryData(
            ACCESS_TOKENS_QUERY_KEY,
            credentials([{ id: "token-1" }, { id: "token-2" }]),
        );
        mockDeleteMyAccessToken.mockResolvedValue({ data: undefined, error: null });

        const { result } = renderHook(() => useDeleteAllAccessTokens(), {
            wrapper: createWrapper(),
        });
        result.current.mutate(["token-1", "token-2"]);

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(mockDeleteMyAccessToken).toHaveBeenCalledTimes(2);
        expect(mockDeleteMyAccessToken).toHaveBeenCalledWith({
            path: { accessTokenId: "token-1" },
        });
        expect(mockDeleteMyAccessToken).toHaveBeenCalledWith({
            path: { accessTokenId: "token-2" },
        });
        expect(queryClient.getQueryData(ACCESS_TOKENS_QUERY_KEY)).toEqual(credentials([]));
    });

    it.each([
        [
            { id: "at_opaque", name: "Renamed" },
            { accessTokenId: "at_opaque", name: "Renamed" },
        ],
        [
            { id: "at_opaque", scopes: [], expiresAt: null },
            { accessTokenId: "at_opaque", scopes: [], expires: null },
        ],
    ])("sends partial edits without changing omitted fields: %j", async (input, body) => {
        mockPatchMyAccessToken.mockResolvedValue({
            data: {
                userId: "user-1",
                accessTokenId: "at_opaque",
                name: "Renamed",
                scopes: [],
                origin: "User",
            },
        });
        const { result } = renderHook(() => useUpdateAccessToken(), { wrapper: createWrapper() });
        await result.current.mutateAsync(input);
        expect(mockPatchMyAccessToken).toHaveBeenCalledWith({ body });
    });

    it("repeated deletion of an opaque ID succeeds when already absent", async () => {
        queryClient.setQueryData(ACCESS_TOKENS_QUERY_KEY, credentials([{ id: "at_opaque" }]));
        mockDeleteMyAccessToken.mockResolvedValue({
            data: undefined,
            error: null,
            response: { status: 204 },
        });
        const { result } = renderHook(() => useDeleteAccessToken(), { wrapper: createWrapper() });
        await result.current.mutateAsync("at_opaque");
        await result.current.mutateAsync("at_opaque");
        expect(mockDeleteMyAccessToken).toHaveBeenCalledTimes(2);
        expect(mockDeleteMyAccessToken).toHaveBeenLastCalledWith({
            path: { accessTokenId: "at_opaque" },
        });
        expect(queryClient.getQueryData(ACCESS_TOKENS_QUERY_KEY)).toEqual(credentials([]));
    });
});

describe("useOwnCredentials", () => {
    let queryClient: QueryClient;

    const createWrapper =
        () =>
        ({ children }: { children: React.ReactNode }) =>
            createElement(QueryClientProvider, { client: queryClient }, children);

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });
    });

    it("groups the listing into personal tokens and connected apps under one cache entry", async () => {
        mockGetMyAccessTokens.mockResolvedValue({
            data: [
                {
                    userId: "user-1",
                    accessTokenId: "personal-token",
                    name: "Product sync",
                    scopes: [],
                    origin: "User",
                },
                {
                    userId: "user-1",
                    connectionId: "ocn_agent",
                    name: "Claude Code",
                    scopes: ["watchlist:read"],
                    origin: "OAuthMetadataDocument",
                    client: {
                        clientId: "https://claude.ai/oauth/claude-code-client-metadata",
                        name: "Claude Code",
                        kind: "METADATA_DOCUMENT",
                        host: "claude.ai",
                    },
                    created: "2026-11-01T09:00:00Z",
                    lastUsed: "2026-11-06T12:00:00Z",
                },
            ],
            error: null,
        });

        const { result } = renderHook(() => useOwnCredentials(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data?.personalTokens.map((token) => token.id)).toEqual([
            "personal-token",
        ]);
        expect(result.current.data?.connectedApps).toHaveLength(1);
        expect(result.current.data?.connectedApps[0]?.connection).toEqual({
            id: "ocn_agent",
            connectedAt: new Date("2026-11-01T09:00:00Z"),
            lastUsedAt: new Date("2026-11-06T12:00:00Z"),
        });
        expect(queryClient.getQueryData(ACCESS_TOKENS_QUERY_KEY)).toEqual(result.current.data);
    });
});

describe("useDisconnectConnectedApp", () => {
    let queryClient: QueryClient;

    const createWrapper =
        () =>
        ({ children }: { children: React.ReactNode }) =>
            createElement(QueryClientProvider, { client: queryClient }, children);

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
        });
    });

    it("disconnects the client by its ID and removes only that app from the cache", async () => {
        queryClient.setQueryData(
            ACCESS_TOKENS_QUERY_KEY,
            credentials([{ id: "token-1" }], [SHOPIFY_APP, WOOCOMMERCE_APP]),
        );
        mockDisconnectMyOAuthClient.mockResolvedValue({ data: undefined, error: null });

        const { result } = renderHook(() => useDisconnectConnectedApp(), {
            wrapper: createWrapper(),
        });
        await result.current.mutateAsync("oc_shopify");

        expect(mockDisconnectMyOAuthClient).toHaveBeenCalledOnce();
        expect(mockDisconnectMyOAuthClient).toHaveBeenCalledWith({
            query: { clientId: "oc_shopify" },
        });
        expect(queryClient.getQueryData(ACCESS_TOKENS_QUERY_KEY)).toEqual(
            credentials([{ id: "token-1" }], [WOOCOMMERCE_APP]),
        );
    });

    it("throws the mapped error and leaves the cache unchanged", async () => {
        const cached = credentials([{ id: "token-1" }], [SHOPIFY_APP, WOOCOMMERCE_APP]);
        queryClient.setQueryData(ACCESS_TOKENS_QUERY_KEY, cached);
        mockDisconnectMyOAuthClient.mockResolvedValue({
            data: undefined,
            error: { message: "Disconnect failed" },
        });
        mockGetErrorMessage.mockReturnValue("Disconnect failed");

        const { result } = renderHook(() => useDisconnectConnectedApp(), {
            wrapper: createWrapper(),
        });

        await expect(result.current.mutateAsync("oc_shopify")).rejects.toThrow("Disconnect failed");
        expect(queryClient.getQueryData(ACCESS_TOKENS_QUERY_KEY)).toBe(cached);
    });
});
