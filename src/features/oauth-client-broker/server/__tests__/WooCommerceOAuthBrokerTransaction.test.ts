import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSqliteDurableObjectState } from "@/test/durableObjectState.ts";
import { sha256Base64Url } from "@/features/oauth-client-broker/lib/brokerCrypto.ts";
import { WooCommerceOAuthBrokerTransaction } from "@/features/oauth-client-broker/server/WooCommerceOAuthBrokerTransaction.ts";
import {
    ACCESS_TOKEN,
    CLIENT_ID,
    createBrokerEnv,
    LISTING_SOURCE_ID,
    MERCHANT_REDIRECT_URI,
    USER_SUB,
} from "@/features/oauth-client-broker/__tests__/brokerTestHarness.ts";

const mockEnv = vi.hoisted(() => ({}) as Record<string, string | undefined>);
vi.mock("@/env.ts", () => ({ env: mockEnv }));

const START = Date.UTC(2026, 9, 30, 12, 0, 0);
const TRANSACTION_ID = "T".repeat(43);
const CLIENT_STATE = "s".repeat(43);
const COMPLETION_SECRET = "c".repeat(43);
const COMPLETION_CODE = "k".repeat(43);
const CALLBACK_STATE = `${TRANSACTION_ID}.${"b".repeat(43)}`;
const SESSION_BINDING = "z".repeat(43);

let hashes: {
    completionChallenge: string;
    completionCode: string;
    callbackState: string;
    sessionBinding: string;
};

beforeEach(async () => {
    hashes = {
        completionChallenge: await sha256Base64Url(COMPLETION_SECRET),
        completionCode: await sha256Base64Url(COMPLETION_CODE),
        callbackState: await sha256Base64Url(CALLBACK_STATE),
        sessionBinding: await sha256Base64Url(SESSION_BINDING),
    };
});

function setup() {
    const state = createSqliteDurableObjectState();
    const object = new WooCommerceOAuthBrokerTransaction(state.ctx, {});
    return { state, object };
}

function rawRecord(state: ReturnType<typeof setup>["state"]): string {
    if (state.tableCount() === 0) return "";
    const [row] = state.ctx.storage.sql
        .exec<{ record: string }>("SELECT record FROM broker_transaction")
        .toArray();
    return row?.record ?? "";
}

async function create(object: WooCommerceOAuthBrokerTransaction) {
    return object.create({
        transactionId: TRANSACTION_ID,
        clientId: CLIENT_ID,
        merchantRedirectUri: MERCHANT_REDIRECT_URI,
        clientState: CLIENT_STATE,
        scope: "product-listings:write",
        completionChallenge: hashes.completionChallenge,
        codeChallenge: "pkce-challenge",
        codeVerifier: "v".repeat(43),
    });
}

async function approve(object: WooCommerceOAuthBrokerTransaction) {
    return object.approve({
        userSub: USER_SUB,
        sessionBindingHash: hashes.sessionBinding,
        callbackStateHash: hashes.callbackState,
        listingSourceId: LISTING_SOURCE_ID,
    });
}

async function claim(object: WooCommerceOAuthBrokerTransaction) {
    return object.claimExchange({
        userSub: USER_SUB,
        sessionBindingHash: hashes.sessionBinding,
        callbackStateHash: hashes.callbackState,
    });
}

async function ready(object: WooCommerceOAuthBrokerTransaction) {
    await create(object);
    await approve(object);
    await claim(object);
    return object.storeCredential(
        { accessToken: ACCESS_TOKEN, tokenType: "Bearer", scope: "product-listings:write" },
        hashes.completionCode,
    );
}

function attempt(code = hashes.completionCode, secretHash = hashes.completionChallenge) {
    return { completionCodeHash: code, completionSecretHash: secretHash };
}

describe("WooCommerceOAuthBrokerTransaction", () => {
    const fetchMock = vi.fn();

    beforeEach(() => {
        Object.assign(mockEnv, createBrokerEnv());
        vi.useFakeTimers({ toFake: ["Date"] });
        vi.setSystemTime(START);
        fetchMock.mockReset().mockResolvedValue(new Response(null, { status: 200 }));
        vi.stubGlobal("fetch", fetchMock);
        vi.spyOn(console, "error").mockImplementation(() => undefined);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it("stores nothing for an unknown transaction that is only probed", async () => {
        const { state, object } = setup();

        expect(object.getConsentView()).toEqual({ status: "invalid" });
        expect(await object.complete(attempt())).toEqual({
            ok: false,
            error: "invalid_transaction",
        });
        expect(state.tableCount()).toBe(0);
        expect(state.state.alarm).toBeUndefined();
    });

    it("creates a transaction with an absolute expiry and an alarm at that expiry", async () => {
        const { state, object } = setup();

        expect(await create(object)).toEqual({ ok: true, value: { expiresAt: START + 900_000 } });
        expect(state.state.alarm).toBe(START + 900_000);
        expect(object.getConsentView()).toEqual({
            status: "pending",
            context: {
                transactionId: TRANSACTION_ID,
                clientId: CLIENT_ID,
                merchantRedirectUri: MERCHANT_REDIRECT_URI,
                scope: "product-listings:write",
                codeChallenge: "pkce-challenge",
                expiresAt: START + 900_000,
            },
        });
    });

    it("approves once; reading never approves and a second approval is refused", async () => {
        const { object } = setup();
        await create(object);

        object.getConsentView();
        expect(object.getConsentView().status).toBe("pending");
        expect(await approve(object)).toEqual({ ok: true });
        expect(await approve(object)).toEqual({ ok: false, error: "already_answered" });
        expect(object.getConsentView()).toEqual({ status: "answered" });
    });

    it.each([
        ["state", { callbackStateHash: "wrong" }],
        ["browser binding", { sessionBindingHash: "wrong" }],
        ["account", { userSub: "someone-else" }],
    ])("refuses the exchange for another %s without changing the record", async (_, override) => {
        const { state, object } = setup();
        await create(object);
        await approve(object);
        const before = rawRecord(state);

        expect(
            await object.claimExchange({
                userSub: USER_SUB,
                sessionBindingHash: hashes.sessionBinding,
                callbackStateHash: hashes.callbackState,
                ...override,
            }),
        ).toEqual({ ok: false, error: "binding_mismatch" });
        expect(rawRecord(state)).toBe(before);
        expect((await claim(object)).ok).toBe(true);
    });

    it("claims the exchange once and scrubs the verifier from storage", async () => {
        const { state, object } = setup();
        await create(object);
        await approve(object);

        const [first, second] = await Promise.all([claim(object), claim(object)]);

        expect(first).toEqual({
            ok: true,
            value: {
                codeVerifier: "v".repeat(43),
                merchantRedirectUri: MERCHANT_REDIRECT_URI,
                clientState: CLIENT_STATE,
            },
        });
        expect(second).toEqual({ ok: false, error: "already_answered" });
        expect(rawRecord(state)).not.toContain("v".repeat(43));
    });

    it("reports a claimed exchange that never stored a result as pending, then expired", async () => {
        const { object } = setup();
        await create(object);
        await approve(object);
        await claim(object);

        expect(await object.complete(attempt())).toEqual({
            ok: false,
            error: "transaction_pending",
        });
        vi.setSystemTime(START + 900_000);
        expect(await object.complete(attempt())).toEqual({
            ok: false,
            error: "transaction_expired",
        });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("refuses early completion as pending without changing the record", async () => {
        const { state, object } = setup();
        await create(object);
        await approve(object);
        const before = rawRecord(state);

        expect(await object.complete(attempt())).toEqual({
            ok: false,
            error: "transaction_pending",
        });
        expect(rawRecord(state)).toBe(before);
    });

    it("stores only the completion code's hash, never the raw code or secret", async () => {
        const { state, object } = setup();
        await ready(object);

        const record = rawRecord(state);
        expect(record).toContain(hashes.completionCode);
        expect(record).not.toContain(COMPLETION_CODE);
        expect(record).not.toContain(COMPLETION_SECRET);
        expect(state.state.alarm).toBe(START + 120_000);
    });

    it.each([
        ["handle only", "", ""],
        ["code only", "code", "wrong-secret"],
        ["secret only", "wrong-code", "secret"],
        ["both wrong", "wrong-code", "wrong-secret"],
    ])("rejects %s and keeps the result for the legitimate redeemer", async (_, code, secret) => {
        const { object } = setup();
        await ready(object);

        const result = await object.complete(
            attempt(
                code === "code" ? hashes.completionCode : code,
                secret === "secret" ? hashes.completionChallenge : secret,
            ),
        );
        expect(result.ok).toBe(false);
        expect(result).toMatchObject({
            error: code === "code" ? "invalid_completion_proof" : "invalid_completion_code",
        });

        expect(await object.complete(attempt())).toMatchObject({
            ok: true,
            outcome: { kind: "authorized" },
        });
    });

    it("releases the source and credential of the approved transaction exactly once", async () => {
        const { state, object } = setup();
        await ready(object);

        const results = await Promise.all([
            object.complete(attempt()),
            object.complete(attempt()),
            object.complete(attempt()),
        ]);

        const released = results.filter((result) => result.ok);
        expect(released).toEqual([
            {
                ok: true,
                transactionId: TRANSACTION_ID,
                clientState: CLIENT_STATE,
                outcome: { kind: "authorized" },
                listingSourceId: LISTING_SOURCE_ID,
                credential: {
                    accessToken: ACCESS_TOKEN,
                    tokenType: "Bearer",
                    scope: "product-listings:write",
                },
            },
        ]);
        expect(results.filter((result) => !result.ok)).toEqual([
            { ok: false, error: "transaction_consumed" },
            { ok: false, error: "transaction_consumed" },
        ]);
        expect(rawRecord(state)).not.toContain(ACCESS_TOKEN);
    });

    it("does not accept another transaction's code and proof", async () => {
        const first = setup();
        const second = setup();
        await ready(first.object);
        await create(second.object);

        const otherSecret = "o".repeat(43);
        const otherCode = "q".repeat(43);
        expect(
            await first.object.complete(
                attempt(await sha256Base64Url(otherCode), await sha256Base64Url(otherSecret)),
            ),
        ).toEqual({ ok: false, error: "invalid_completion_code" });
        expect(
            await first.object.complete(
                attempt(hashes.completionCode, await sha256Base64Url(otherSecret)),
            ),
        ).toEqual({ ok: false, error: "invalid_completion_proof" });
    });

    it("revokes a credential whose completion code expired undelivered", async () => {
        const { state, object } = setup();
        await ready(object);
        vi.setSystemTime(START + 120_000);

        expect(await object.complete(attempt())).toEqual({
            ok: false,
            error: "transaction_expired",
        });
        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [url, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
        expect(url.toString()).toBe("https://api.test.example/v1/oauth/revoke");
        expect(new URLSearchParams(init.body as URLSearchParams).get("token")).toBe(ACCESS_TOKEN);
        expect(rawRecord(state)).not.toContain(ACCESS_TOKEN);
        expect(await object.complete(attempt())).toEqual({
            ok: false,
            error: "transaction_expired",
        });
    });

    it("revokes an undelivered credential at its alarm and deletes the record at expiry", async () => {
        const { state, object } = setup();
        await ready(object);

        vi.setSystemTime(START + 120_000);
        await object.alarm();
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(rawRecord(state)).not.toContain(ACCESS_TOKEN);
        expect(state.state.alarm).toBe(START + 900_000);

        vi.setSystemTime(START + 900_000);
        await object.alarm();
        expect(state.tableCount()).toBe(0);
        expect(state.state.alarm).toBeUndefined();
        expect(state.state.deletedAll).toBe(1);
    });

    it("retries a failed revocation and gives up only after the grace period", async () => {
        const { state, object } = setup();
        await ready(object);
        fetchMock.mockResolvedValue(new Response(null, { status: 503 }));

        vi.setSystemTime(START + 120_000);
        await object.alarm();
        expect(state.state.alarm).toBe(START + 180_000);
        expect(rawRecord(state)).toContain(ACCESS_TOKEN);
        expect(object.getConsentView()).toEqual({ status: "invalid" });

        vi.setSystemTime(START + 180_000);
        await object.alarm();
        expect(fetchMock).toHaveBeenCalledTimes(2);

        vi.setSystemTime(START + 900_000 + 3_600_000);
        await object.alarm();
        expect(state.tableCount()).toBe(0);
    });

    it("hands off a denial without a credential once", async () => {
        const { object } = setup();
        await create(object);

        expect(
            await object.answerBeforeApproval({
                outcome: { kind: "denied" },
                listingSourceId: LISTING_SOURCE_ID,
                completionCodeHash: hashes.completionCode,
            }),
        ).toEqual({
            ok: true,
            value: { merchantRedirectUri: MERCHANT_REDIRECT_URI, clientState: CLIENT_STATE },
        });
        expect(await approve(object)).toEqual({ ok: false, error: "already_answered" });
        expect(await object.complete(attempt())).toEqual({
            ok: true,
            transactionId: TRANSACTION_ID,
            clientState: CLIENT_STATE,
            outcome: { kind: "denied" },
        });
        expect(await object.complete(attempt())).toEqual({
            ok: false,
            error: "transaction_consumed",
        });
    });

    it("keeps a denial without a verified recipient on Aura Historia", async () => {
        const { object } = setup();
        await create(object);

        await object.answerBeforeApproval({ outcome: { kind: "denied" } });

        expect(object.getConsentView()).toEqual({ status: "declined" });
        expect(await object.complete(attempt())).toEqual({
            ok: false,
            error: "invalid_completion_code",
        });
    });

    it("hands off a failed exchange as a failure outcome", async () => {
        const { object } = setup();
        await create(object);
        await approve(object);
        await claim(object);

        await object.failExchange("invalid_grant", hashes.completionCode);

        expect(await object.complete(attempt())).toEqual({
            ok: true,
            transactionId: TRANSACTION_ID,
            clientState: CLIENT_STATE,
            outcome: { kind: "failed", error: "invalid_grant" },
        });
    });

    it("expires every phase at the absolute transaction expiry", async () => {
        const { object } = setup();
        await create(object);
        vi.setSystemTime(START + 900_000);

        expect(object.getConsentView()).toEqual({ status: "invalid" });
        expect(await approve(object)).toEqual({ ok: false, error: "invalid_transaction" });
        expect(await object.complete(attempt())).toEqual({
            ok: false,
            error: "transaction_expired",
        });
    });

    it("refuses to keep a credential exchanged after the transaction expired", async () => {
        const { object } = setup();
        await create(object);
        await approve(object);
        await claim(object);
        vi.setSystemTime(START + 900_000);

        expect(
            await object.storeCredential(
                { accessToken: ACCESS_TOKEN, tokenType: "Bearer", scope: "x" },
                hashes.completionCode,
            ),
        ).toEqual({ ok: false, error: "transaction_expired" });
    });

    it("never extends the completion code past the transaction expiry", async () => {
        const { state, object } = setup();
        await create(object);
        await approve(object);
        await claim(object);
        vi.setSystemTime(START + 850_000);

        await object.storeCredential(
            { accessToken: ACCESS_TOKEN, tokenType: "Bearer", scope: "x" },
            hashes.completionCode,
        );

        expect(state.state.alarm).toBe(START + 900_000);
    });
});
