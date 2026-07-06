import { createElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAccessTokens } from "@/features/partner/access-token-management/api/useAccessTokens.ts";

const mockGetMyAccessTokens = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn());

vi.mock("@/client", () => ({
    getMyAccessTokens: mockGetMyAccessTokens,
}));

vi.mock("@/hooks/common/useApiError.ts", () => ({
    useApiError: () => ({
        getErrorMessage: mockGetErrorMessage,
    }),
}));

vi.mock("@/data/internal/hooks/ApiError.ts", () => ({
    mapToInternalApiError: (error: unknown) => error,
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
});
