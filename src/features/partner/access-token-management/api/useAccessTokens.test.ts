import { createElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    ACCESS_TOKENS_QUERY_KEY,
    useAccessTokens,
    useCreateAccessToken,
    useUpdateAccessToken,
} from "@/features/partner/access-token-management/api/useAccessTokens.ts";
import type { AccessToken } from "@/features/partner/access-token-management/types/AccessToken.ts";

const mockGetMyAccessTokens = vi.hoisted(() => vi.fn());
const mockPostMyAccessToken = vi.hoisted(() => vi.fn());
const mockPatchMyAccessToken = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn());

vi.mock("@/client", () => ({
    getMyAccessTokens: mockGetMyAccessTokens,
    postMyAccessToken: mockPostMyAccessToken,
    patchMyAccessToken: mockPatchMyAccessToken,
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

    it("loads, maps, and sorts the authenticated user's access tokens", async () => {
        mockGetMyAccessTokens.mockResolvedValue({
            data: [
                {
                    accessTokenId: "older-token",
                    name: "Older token",
                    token: "aurahistoria_older_****",
                    tokenType: "BEARER",
                    createdBy: "user-1",
                    updatedBy: "user-1",
                    created: "2026-06-01T12:00:00Z",
                    updated: "2026-06-01T12:00:00Z",
                },
                {
                    accessTokenId: "newer-token",
                    name: "Newer token",
                    scope: ["products:write"],
                    token: "aurahistoria_newer_****",
                    tokenType: "BEARER",
                    createdBy: "user-1",
                    updatedBy: "user-1",
                    created: "2026-07-01T12:00:00Z",
                    updated: "2026-07-01T12:00:00Z",
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
        expect(result.current.data?.[0]).toMatchObject({
            name: "Newer token",
            scopes: ["products:write"],
            created: new Date("2026-07-01T12:00:00Z"),
        });
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
                accessTokenId: "created-token",
                name: "Product sync",
                scope: ["products:write"],
                token: "aurahistoria_plaintext_token",
                tokenType: "BEARER",
                expiresAt: "2026-08-01T10:00:00.000Z",
                createdBy: "user-1",
                updatedBy: "user-1",
                created: "2026-07-06T10:00:00Z",
                updated: "2026-07-06T10:00:00Z",
            },
            error: null,
        });
        const expiresAt = new Date("2026-08-01T10:00:00.000Z");

        const { result } = renderHook(() => useCreateAccessToken(), {
            wrapper: createWrapper(),
        });
        result.current.mutate({
            name: "Product sync",
            scopes: ["products:write"],
            expiresAt,
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(mockPostMyAccessToken).toHaveBeenCalledWith({
            body: {
                name: "Product sync",
                scope: ["products:write"],
                expiresAt: "2026-08-01T10:00:00.000Z",
            },
        });
        expect(result.current.data).toMatchObject({
            plaintextToken: "aurahistoria_plaintext_token",
            accessToken: {
                id: "created-token",
                name: "Product sync",
            },
        });
        expect(invalidateQueries).toHaveBeenCalledWith({
            queryKey: ACCESS_TOKENS_QUERY_KEY,
        });
    });

    it("omits optional create fields when they are empty", async () => {
        mockPostMyAccessToken.mockResolvedValue({
            data: {
                accessTokenId: "created-token",
                name: "Unscoped token",
                token: "aurahistoria_plaintext_token",
                tokenType: "BEARER",
                createdBy: "user-1",
                updatedBy: "user-1",
                created: "2026-07-06T10:00:00Z",
                updated: "2026-07-06T10:00:00Z",
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
                scope: undefined,
                expiresAt: undefined,
            },
        });
    });

    it("updates editable metadata and replaces the cached token", async () => {
        queryClient.setQueryData(ACCESS_TOKENS_QUERY_KEY, [
            {
                id: "token-123",
                name: "Old name",
                scopes: [],
                maskedToken: "aurahistoria_old_****",
                tokenType: "BEARER",
                expiresAt: null,
                created: new Date("2026-07-01T10:00:00Z"),
                updated: new Date("2026-07-01T10:00:00Z"),
            },
        ]);
        mockPatchMyAccessToken.mockResolvedValue({
            data: {
                accessTokenId: "token-123",
                name: "Product sync",
                scope: ["products:write"],
                token: "aurahistoria_obfuscated_****",
                tokenType: "BEARER",
                expiresAt: "2026-08-01T10:00:00.000Z",
                createdBy: "user-1",
                updatedBy: "user-1",
                created: "2026-07-01T10:00:00Z",
                updated: "2026-07-06T10:00:00Z",
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
            scopes: ["products:write"],
            expiresAt,
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(mockPatchMyAccessToken).toHaveBeenCalledWith({
            body: {
                accessTokenId: "token-123",
                name: "Product sync",
                scope: ["products:write"],
                expiresAt: "2026-08-01T10:00:00.000Z",
            },
        });
        expect(queryClient.getQueryData<AccessToken[]>(ACCESS_TOKENS_QUERY_KEY)?.[0]).toMatchObject(
            {
                name: "Product sync",
                maskedToken: "aurahistoria_obfuscated_****",
            },
        );
    });
});
