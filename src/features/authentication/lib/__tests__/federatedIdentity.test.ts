import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFetchAuthSession = vi.hoisted(() => vi.fn());

vi.mock("aws-amplify/auth", () => ({
    fetchAuthSession: mockFetchAuthSession,
}));

import {
    parseFederatedIdentity,
    readFederatedIdentity,
} from "@/features/authentication/lib/federatedIdentity.ts";

const AUTH_TIME_SECONDS = 1_791_550_000;

function googleIdentity(dateCreated: number) {
    return {
        userId: "109876543210",
        providerName: "Google",
        providerType: "Google",
        issuer: null,
        primary: "true",
        dateCreated: String(dateCreated),
    };
}

function idTokenPayload(overrides: Record<string, unknown> = {}) {
    return {
        sub: "4f3c-sub",
        "cognito:username": "google_109876543210",
        email: "user@example.com",
        given_name: " François ",
        family_name: "Müller",
        auth_time: AUTH_TIME_SECONDS,
        iat: AUTH_TIME_SECONDS,
        identities: [googleIdentity(AUTH_TIME_SECONDS * 1000 - 2_000)],
        ...overrides,
    };
}

describe("parseFederatedIdentity", () => {
    it("reads the profile claims of a user Cognito created during this sign-in", () => {
        expect(parseFederatedIdentity(idTokenPayload())).toEqual({
            email: "user@example.com",
            firstName: "François",
            lastName: "Müller",
            isNewUser: true,
        });
    });

    it("marks a user whose provider identity is older as returning", () => {
        const payload = idTokenPayload({
            identities: [googleIdentity(AUTH_TIME_SECONDS * 1000 - 6 * 60 * 1000)],
        });

        expect(parseFederatedIdentity(payload)).toMatchObject({ isNewUser: false });
    });

    it("does not treat a user as new without a provider identity timestamp", () => {
        const payload = idTokenPayload({
            identities: [{ ...googleIdentity(0), dateCreated: undefined }],
        });

        expect(parseFederatedIdentity(payload)).toMatchObject({ isNewUser: false });
    });

    it("omits blank or missing profile claims", () => {
        const payload = idTokenPayload({ given_name: "  ", family_name: undefined });

        expect(parseFederatedIdentity(payload)).toEqual({
            email: "user@example.com",
            isNewUser: true,
        });
    });

    it("matches the Cognito username case-insensitively and without it", () => {
        expect(
            parseFederatedIdentity(idTokenPayload({ "cognito:username": "Google_109876543210" })),
        ).not.toBeNull();
        expect(
            parseFederatedIdentity(idTokenPayload({ "cognito:username": undefined })),
        ).not.toBeNull();
    });

    it("returns null for native users and native users with a linked provider", () => {
        expect(parseFederatedIdentity(idTokenPayload({ identities: undefined }))).toBeNull();
        expect(
            parseFederatedIdentity(idTokenPayload({ "cognito:username": "4f3c-sub" })),
        ).toBeNull();
    });

    it("returns null for malformed identities and a missing payload", () => {
        expect(parseFederatedIdentity(idTokenPayload({ identities: "Google" }))).toBeNull();
        expect(parseFederatedIdentity(idTokenPayload({ identities: [null, 1] }))).toBeNull();
        expect(parseFederatedIdentity(undefined)).toBeNull();
    });
});

describe("readFederatedIdentity", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("reads the identity from the current ID token", async () => {
        mockFetchAuthSession.mockResolvedValue({
            tokens: { idToken: { payload: idTokenPayload() } },
        });

        await expect(readFederatedIdentity()).resolves.toMatchObject({
            email: "user@example.com",
            isNewUser: true,
        });
    });

    it("returns null without a session", async () => {
        mockFetchAuthSession.mockResolvedValueOnce({ tokens: undefined });
        await expect(readFederatedIdentity()).resolves.toBeNull();

        mockFetchAuthSession.mockRejectedValueOnce(new Error("raw Cognito detail"));
        await expect(readFederatedIdentity()).resolves.toBeNull();
    });
});
