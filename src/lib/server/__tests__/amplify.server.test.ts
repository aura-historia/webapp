import { beforeEach, describe, expect, it, vi } from "vitest";
import { getServerAuthToken, getServerUserSession } from "../amplify.server.ts";
import { deleteCookie, getCookies, setCookie } from "@tanstack/react-start/server";
import {
    createAWSCredentialsAndIdentityIdProvider,
    createKeyValueStorageFromCookieStorageAdapter,
    createUserPoolsTokenProvider,
    runWithAmplifyServerContext,
} from "aws-amplify/adapter-core";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth/server";

const mockContextSpec = vi.hoisted(() => ({ token: { value: Symbol("token") } }));

vi.mock("@tanstack/react-start/server", () => ({
    getCookies: vi.fn(),
    setCookie: vi.fn(),
    deleteCookie: vi.fn(),
}));

vi.mock("aws-amplify/adapter-core", () => ({
    createAWSCredentialsAndIdentityIdProvider: vi.fn(() => "credentials-provider"),
    createKeyValueStorageFromCookieStorageAdapter: vi.fn((adapter) => {
        adapter.get("auth-cookie");
        adapter.get("missing-cookie");
        adapter.getAll();
        adapter.set("new-cookie", "new-value", { sameSite: "strict" });
        adapter.delete("old-cookie");
        return "key-value-storage";
    }),
    createUserPoolsTokenProvider: vi.fn(() => "token-provider"),
    runWithAmplifyServerContext: vi.fn((_config, _providers, operation) =>
        operation(mockContextSpec),
    ),
}));

vi.mock("aws-amplify/auth/server", () => ({
    fetchAuthSession: vi.fn(),
    getCurrentUser: vi.fn(),
}));

vi.mock("@/amplify-config", () => ({
    amplifyConfig: { Auth: { userPoolId: "test-pool" } },
}));

describe("Amplify server helpers", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getCookies).mockReturnValue({ "auth-cookie": "session-value" });
    });

    it("returns the authenticated server user session", async () => {
        vi.mocked(getCurrentUser).mockResolvedValue({
            username: "test-user",
            userId: "test-user-id",
        });

        const result = await getServerUserSession();

        expect(result).toEqual({
            user: { username: "test-user", userId: "test-user-id" },
            authenticated: true,
        });
        expect(getCurrentUser).toHaveBeenCalledWith(mockContextSpec);
        expectAmplifyServerContextWasConfigured();
    });

    it("returns an unauthenticated session when current user lookup fails", async () => {
        vi.mocked(getCurrentUser).mockRejectedValue(new Error("No user"));

        await expect(getServerUserSession()).resolves.toEqual({
            user: null,
            authenticated: false,
        });
    });

    it("returns the current access token string", async () => {
        vi.mocked(fetchAuthSession).mockResolvedValue({
            tokens: {
                accessToken: {
                    toString: () => "access-token",
                },
            },
        } as Awaited<ReturnType<typeof fetchAuthSession>>);

        const result = await getServerAuthToken();

        expect(result).toBe("access-token");
        expect(fetchAuthSession).toHaveBeenCalledWith(mockContextSpec);
        expectAmplifyServerContextWasConfigured();
    });

    it("returns undefined when token lookup fails", async () => {
        vi.mocked(fetchAuthSession).mockRejectedValue(new Error("No session"));

        await expect(getServerAuthToken()).resolves.toBeUndefined();
    });
});

function expectAmplifyServerContextWasConfigured() {
    expect(createKeyValueStorageFromCookieStorageAdapter).toHaveBeenCalledTimes(1);
    expect(setCookie).toHaveBeenCalledWith(
        "new-cookie",
        "new-value",
        expect.objectContaining({
            maxAge: 365 * 24 * 60 * 60,
            path: "/",
            sameSite: "strict",
            secure: true,
        }),
    );
    expect(deleteCookie).toHaveBeenCalledWith("old-cookie", {
        expires: expect.any(Date),
    });
    expect(createAWSCredentialsAndIdentityIdProvider).toHaveBeenCalledWith(
        { userPoolId: "test-pool" },
        "key-value-storage",
    );
    expect(createUserPoolsTokenProvider).toHaveBeenCalledWith(
        { userPoolId: "test-pool" },
        "key-value-storage",
    );
    expect(runWithAmplifyServerContext).toHaveBeenCalledWith(
        { Auth: { userPoolId: "test-pool" } },
        {
            Auth: {
                credentialsProvider: "credentials-provider",
                tokenProvider: "token-provider",
            },
        },
        expect.any(Function),
    );
}
