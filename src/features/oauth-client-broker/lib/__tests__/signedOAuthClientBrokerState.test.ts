import { describe, expect, it } from "vitest";
import {
    decodeOAuthClientBrokerState,
    encodeOAuthClientBrokerState,
} from "../oauthClientBrokerState.ts";
import {
    getS256Challenge,
    signOAuthClientBrokerState,
    verifyOAuthClientBrokerState,
} from "../signedOAuthClientBrokerState.ts";

const state = {
    redirectUri: "https://merchant.example/callback",
    codeVerifier: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~",
    clientState: "merchant-csrf",
    listingSourceId: "ls_6rd827eqfefsva9teecmwa3ate",
};
const context = "oc_test\nhttps://auth.example/api/oauth/client/redirect-broker/woocommerce";

describe("signed broker state", () => {
    it("binds the canonical source, final redirect, verifier and client state", async () => {
        const signed = await signOAuthClientBrokerState(state, "secret", context, 1000);
        expect(await verifyOAuthClientBrokerState(signed, "secret", context, 2000)).toEqual(state);
        expect(signed).not.toContain("secret");
    });

    it("rejects changes to the source, verifier, redirect or client state", async () => {
        const signed = await signOAuthClientBrokerState(state, "secret", context, 1000);
        const [issued, , signature] = signed.split(".");
        for (const mutation of [
            { listingSourceId: "ls_attacker" },
            { redirectUri: "https://attacker.example/callback" },
            { codeVerifier: "x".repeat(43) },
            { clientState: "attacker" },
        ]) {
            const tampered = `${issued}.${encodeOAuthClientBrokerState({ ...state, ...mutation })}.${signature}`;
            await expect(
                verifyOAuthClientBrokerState(tampered, "secret", context, 2000),
            ).rejects.toThrow();
        }
    });

    it("rejects expired, future, wrong-client and wrong-key envelopes", async () => {
        const signed = await signOAuthClientBrokerState(state, "secret", context, 1000);
        for (const [secret, boundContext, now] of [
            ["secret", context, 601001],
            ["secret", context, 999],
            ["other", context, 2000],
            ["secret", "oc_other", 2000],
        ] as const) {
            await expect(
                verifyOAuthClientBrokerState(signed, secret, boundContext, now),
            ).rejects.toThrow();
        }
    });

    it("accepts legacy aliases at initiation, but rejects unsigned callbacks", async () => {
        const legacy = btoa(
            JSON.stringify({
                redirectUri: state.redirectUri,
                codeVerifier: state.codeVerifier,
                state: "csrf",
            }),
        );
        expect(decodeOAuthClientBrokerState(legacy).clientState).toBe("csrf");
        await expect(verifyOAuthClientBrokerState(legacy, "secret", context)).rejects.toThrow();
    });

    it("rejects legacy shop identifiers and conflicting aliases", () => {
        for (const fields of [
            { shopId: "old-shop" },
            { partner_shop_id: "old-shop" },
            { redirect_uri: "https://attacker.example/callback" },
        ]) {
            const legacy = btoa(
                JSON.stringify({
                    redirectUri: state.redirectUri,
                    codeVerifier: state.codeVerifier,
                    ...fields,
                }),
            );
            expect(() => decodeOAuthClientBrokerState(legacy)).toThrow();
        }
    });

    it("preserves the RFC 7636 S256 challenge", async () => {
        expect(await getS256Challenge("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk")).toBe(
            "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
        );
    });
});
