import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import testI18n from "@/i18n/i18nForTests";
import {
    adminUserAccessTokensQueryKey,
    createAdminUserSecurityErrorFactory,
    useAdminUserAccessTokens,
    useAdminUserSecurityActions,
} from "../useAdminUserSecurity.ts";

const api = vi.hoisted(() => ({
    suspend: vi.fn(),
    unsuspend: vi.fn(),
    sessions: vi.fn(),
    listTokens: vi.fn(),
    revokeToken: vi.fn(),
    revokeAllTokens: vi.fn(),
}));
vi.mock("@/client", () => ({
    adminSuspendUser: api.suspend,
    adminUnsuspendUser: api.unsuspend,
    adminRevokeUserSessions: api.sessions,
    adminListUserAccessTokens: api.listTokens,
    adminDeleteUserAccessToken: api.revokeToken,
    adminDeleteUserAccessTokens: api.revokeAllTokens,
}));

const ok = (data: unknown, status = 200) => ({ data, response: { status, ok: true } });
const noContent = () => ({ data: undefined, response: { status: 204, ok: true } });
const failure = (status: number, detail?: string) => ({
    error: { status, title: "Problem", error: "CONFLICT", detail },
    response: { status, ok: false },
});

const token = (userId: string, accessTokenId: string, extra: Record<string, unknown> = {}) => ({
    userId,
    accessTokenId,
    name: `Token ${accessTokenId}`,
    scopes: ["users:read"],
    origin: "User",
    expires: null,
    ...extra,
});

describe("admin user security API", () => {
    let client: QueryClient;
    const wrapper = ({ children }: { children: ReactNode }) =>
        createElement(QueryClientProvider, { client }, children);

    beforeEach(() => {
        vi.clearAllMocks();
        client = new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
        });
    });

    it("uses separate suspend, unsuspend, and Cognito session operations", async () => {
        api.suspend.mockResolvedValueOnce(ok({ userId: "usr_target", suspended: true }));
        api.unsuspend.mockResolvedValueOnce(ok({ userId: "usr_target", suspended: false }));
        api.sessions.mockResolvedValueOnce(noContent());
        const hook = renderHook(() => useAdminUserSecurityActions(), { wrapper });

        await act(async () => {
            await expect(
                hook.result.current.suspend({ userId: "usr_target", reason: "Policy breach" }),
            ).resolves.toMatchObject({ suspended: true });
            await expect(hook.result.current.unsuspend("usr_target")).resolves.toMatchObject({
                suspended: false,
            });
            await expect(hook.result.current.revokeSessions("usr_target")).resolves.toBeUndefined();
        });

        expect(api.suspend).toHaveBeenCalledWith({
            path: { userId: "usr_target" },
            body: { reason: "Policy breach" },
            cache: "no-store",
        });
        expect(api.unsuspend).toHaveBeenCalledWith({
            path: { userId: "usr_target" },
            cache: "no-store",
        });
        expect(api.sessions).toHaveBeenCalledWith({
            path: { userId: "usr_target" },
            cache: "no-store",
        });
        expect(api.revokeToken).not.toHaveBeenCalled();
        expect(api.revokeAllTokens).not.toHaveBeenCalled();
    });

    it("maps a final-active-admin suspension conflict without exposing backend detail", async () => {
        api.suspend.mockResolvedValueOnce(failure(409, "Private internal account detail"));
        const hook = renderHook(() => useAdminUserSecurityActions(), { wrapper });

        await act(async () => {
            await expect(
                hook.result.current.suspend({ userId: "usr_admin", reason: "Security review" }),
            ).rejects.toMatchObject({
                status: 409,
                message: testI18n.t("adminUsers.errors.lastAdmin"),
            });
        });
        expect(api.suspend).toHaveBeenCalledTimes(1);
        expect(api.suspend.mock.calls[0]?.[0].body.reason).toBe("Security review");
    });

    it("serializes tuple cursors as one JSON query value and maps only safe metadata", async () => {
        api.listTokens
            .mockResolvedValueOnce(
                ok({
                    items: [
                        token("usr_target", "at_first", {
                            token: "raw-secret",
                            tokenHash: "hash-secret",
                            maskedToken: "masked-secret",
                            created: "2026-01-01T00:00:00Z",
                        }),
                    ],
                    size: 1,
                    searchAfter: ["2026-01-01T00:00:00Z", "at_first"],
                }),
            )
            .mockResolvedValueOnce(ok({ items: [token("usr_target", "at_second")], size: 1 }));

        const hook = renderHook(() => useAdminUserAccessTokens("usr_target"), { wrapper });
        await waitFor(() => expect(hook.result.current.data?.pages).toHaveLength(1));

        expect(hook.result.current.data?.pages[0]?.items[0]).toEqual({
            accessTokenId: "at_first",
            name: "Token at_first",
            scopes: ["users:read"],
            origin: "User",
            expires: null,
        });
        expect(JSON.stringify(hook.result.current.data)).not.toMatch(
            /raw-secret|hash-secret|masked-secret/,
        );
        expect(hook.result.current.data?.pages[0]?.items[0]).not.toHaveProperty("created");
        expect(api.listTokens).toHaveBeenCalledWith({
            path: { userId: "usr_target" },
            query: { size: 21 },
            signal: expect.any(AbortSignal),
            cache: "no-store",
        });

        await act(async () => {
            await hook.result.current.fetchNextPage();
        });
        expect(api.listTokens).toHaveBeenLastCalledWith({
            path: { userId: "usr_target" },
            query: { size: 21, searchAfter: '["2026-01-01T00:00:00Z","at_first"]' },
            signal: expect.any(AbortSignal),
            cache: "no-store",
        });
    });

    it("scopes token-list cache keys and reads to the selected user", async () => {
        api.listTokens
            .mockResolvedValueOnce(ok({ items: [token("usr_first", "at_first")], size: 1 }))
            .mockResolvedValueOnce(ok({ items: [token("usr_second", "at_second")], size: 1 }));
        const hook = renderHook(({ userId }) => useAdminUserAccessTokens(userId), {
            initialProps: { userId: "usr_first" },
            wrapper,
        });
        await waitFor(() =>
            expect(hook.result.current.data?.pages[0]?.items[0]?.accessTokenId).toBe("at_first"),
        );

        hook.rerender({ userId: "usr_second" });
        await waitFor(() =>
            expect(hook.result.current.data?.pages[0]?.items[0]?.accessTokenId).toBe("at_second"),
        );

        expect(api.listTokens).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({ path: { userId: "usr_first" } }),
        );
        expect(api.listTokens).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({ path: { userId: "usr_second" } }),
        );
        expect(hook.result.current.data?.pages.flatMap((page) => page.items)).not.toContainEqual(
            expect.objectContaining({ accessTokenId: "at_first" }),
        );
        expect(adminUserAccessTokensQueryKey("usr_first")).not.toEqual(
            adminUserAccessTokensQueryKey("usr_second"),
        );
    });

    it("does not display token metadata if the server returns it for a different user", async () => {
        api.listTokens.mockResolvedValueOnce(
            ok({ items: [token("usr_other", "at_other")], size: 1 }),
        );
        const hook = renderHook(() => useAdminUserAccessTokens("usr_target"), { wrapper });

        await waitFor(() => expect(hook.result.current.isError).toBe(true));
        expect(hook.result.current.data).toBeUndefined();
        expect(hook.result.current.error?.message).toBe(
            testI18n.t("adminUsers.errors.requestFailed"),
        );
    });

    it("accepts idempotent 204 token revocations scoped to the explicit target user", async () => {
        api.revokeToken.mockResolvedValueOnce(noContent());
        api.revokeAllTokens.mockResolvedValueOnce(noContent());
        const firstUserKey = adminUserAccessTokensQueryKey("usr_first");
        const otherUserKey = adminUserAccessTokensQueryKey("usr_other");
        client.setQueryData(firstUserKey, { pages: [], pageParams: [] });
        client.setQueryData(otherUserKey, { pages: [], pageParams: [] });
        const hook = renderHook(() => useAdminUserSecurityActions(), { wrapper });

        await act(async () => {
            await expect(
                hook.result.current.revokeToken({ userId: "usr_first", accessTokenId: "at_first" }),
            ).resolves.toBeUndefined();
            await expect(hook.result.current.revokeAllTokens("usr_first")).resolves.toBeUndefined();
        });

        expect(api.revokeToken).toHaveBeenCalledWith({
            path: { userId: "usr_first", accessTokenId: "at_first" },
            cache: "no-store",
        });
        expect(api.revokeAllTokens).toHaveBeenCalledWith({
            path: { userId: "usr_first" },
            cache: "no-store",
        });
        expect(client.getQueryState(firstUserKey)?.isInvalidated).toBe(true);
        expect(client.getQueryState(otherUserKey)?.isInvalidated).toBe(false);
        expect(api.sessions).not.toHaveBeenCalled();
    });

    it("does not accept a bodyless non-204 result for a revocation operation", async () => {
        api.revokeAllTokens.mockResolvedValueOnce({
            data: undefined,
            response: { status: 200, ok: true },
        });
        const hook = renderHook(() => useAdminUserSecurityActions(), { wrapper });

        await act(async () => {
            await expect(hook.result.current.revokeAllTokens("usr_target")).rejects.toMatchObject({
                status: 200,
                message: testI18n.t("adminUsers.errors.requestFailed"),
            });
        });
    });

    it("localizes invalid status errors without rendering backend details", () => {
        const requestError = createAdminUserSecurityErrorFactory(testI18n.t);
        expect(requestError(400, "suspend").message).toBe(
            testI18n.t("adminUsers.security.errors.invalid"),
        );
    });
});
