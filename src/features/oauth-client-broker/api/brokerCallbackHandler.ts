import { getServerAuthIdentity } from "@/lib/server/amplify.server.ts";
import {
    createRandomBase64Url,
    sha256Base64Url,
} from "@/features/oauth-client-broker/lib/brokerCrypto.ts";
import { buildMerchantHandoffUrl } from "@/features/oauth-client-broker/lib/brokerMerchantRedirectUri.ts";
import {
    BROKER_CALLBACK_STATE_PATTERN,
    type BrokerConsentError,
} from "@/features/oauth-client-broker/lib/brokerProtocol.ts";
import { getBrokerConsentPageUrl } from "@/features/oauth-client-broker/lib/brokerUrls.ts";
import {
    exchangeAuthorizationCode,
    revokeAccessToken,
} from "@/features/oauth-client-broker/server/brokerBackend.ts";
import { getBrokerTransaction } from "@/features/oauth-client-broker/server/brokerBindings.ts";
import type { ExchangeClaim } from "@/features/oauth-client-broker/server/brokerTransactionMachine.ts";
import {
    getWooCommerceBrokerConfig,
    type WooCommerceBrokerConfig,
} from "@/features/oauth-client-broker/server/brokerConfig.ts";
import {
    clearSessionBindingCookie,
    getSessionBindingCookieName,
    readCookie,
    redirectResponse,
} from "@/features/oauth-client-broker/server/brokerHttp.ts";

type BrokerTransactionStub = NonNullable<ReturnType<typeof getBrokerTransaction>>;

/**
 * OAuth callback, backend redirect → broker. Exchanges the code only for the approved transaction,
 * in the browser and account that approved it, and returns the merchant nothing but the
 * transaction reference, its own state and a fresh completion code. Anything unexpected,
 * including the retired unsigned state, stays on an Aura Historia page.
 */
export async function getWooCommerceBrokerCallback({ request }: { request: Request }) {
    const config = getWooCommerceBrokerConfig();
    if (!config) return consentError("unavailable");

    const requestUrl = new URL(request.url);
    const expectedUrl = new URL(config.callbackUrl);
    if (requestUrl.origin !== expectedUrl.origin || requestUrl.pathname !== expectedUrl.pathname) {
        return consentError("invalid_request");
    }

    const callback = readCallbackParams(requestUrl.searchParams);
    if (!callback) return consentError("invalid_request");
    const { transactionId, state, code } = callback;

    const transaction = getBrokerTransaction(transactionId);
    if (!transaction) return consentError("unavailable");

    const identity = await getServerAuthIdentity();
    const sessionBinding = readCookie(request, getSessionBindingCookieName(transactionId));
    if (!identity || !sessionBinding) {
        return consentError("session_mismatch");
    }

    let claim: Awaited<ReturnType<BrokerTransactionStub["claimExchange"]>>;
    try {
        claim = await transaction.claimExchange({
            callbackStateHash: await sha256Base64Url(state),
            sessionBindingHash: await sha256Base64Url(sessionBinding),
            userSub: identity.userSub,
        });
    } catch {
        return storageUnavailable("claim");
    }
    // A failed attempt leaves the approving browser's binding in place; a claim consumes it.
    if (!claim.ok) {
        return consentError(
            claim.error === "binding_mismatch" ? "session_mismatch" : "invalid_request",
        );
    }
    return exchangeAndHandOff({ transaction, transactionId, code, claim: claim.value, config });
}

/**
 * Redeems the claimed code once and hands the outcome to the merchant: the stored credential, or
 * the failure. A credential that cannot be kept is revoked rather than left issued.
 */
async function exchangeAndHandOff(params: {
    readonly transaction: BrokerTransactionStub;
    readonly transactionId: string;
    readonly code: string;
    readonly claim: ExchangeClaim;
    readonly config: WooCommerceBrokerConfig;
}): Promise<Response> {
    const { transaction, claim, config } = params;
    const clearBinding = [clearSessionBindingCookie(params.transactionId)];
    const exchange = await exchangeAuthorizationCode({
        code: params.code,
        codeVerifier: claim.codeVerifier,
        ...(claim.resource === undefined ? {} : { resource: claim.resource }),
        config,
        now: Date.now,
    });

    const completionCode = createRandomBase64Url();
    const completionCodeHash = await sha256Base64Url(completionCode);
    const handoffResponse = () =>
        redirectResponse(
            buildMerchantHandoffUrl(claim.merchantRedirectUri, {
                transactionId: params.transactionId,
                clientState: claim.clientState,
                completionCode,
            }),
            clearBinding,
        );

    if (!exchange.ok) {
        try {
            const failed = await transaction.failExchange(exchange.error, completionCodeHash);
            return failed.ok ? handoffResponse() : consentError("invalid_request", clearBinding);
        } catch {
            return storageUnavailable("fail", clearBinding);
        }
    }

    try {
        const stored = await transaction.storeCredential(exchange.credential, completionCodeHash);
        if (stored.ok) return handoffResponse();
        await revokeUndelivered(exchange.credential.accessToken, config);
        return consentError("invalid_request", clearBinding);
    } catch {
        // The exchange succeeded but the result could not be kept: never leave it issued.
        await revokeUndelivered(exchange.credential.accessToken, config);
        return storageUnavailable("store", clearBinding);
    }
}

/**
 * `state` and `code` exactly once and no error: the broker's approval only ever forwards a
 * successful redirect. Returns `undefined` for anything else, including legacy unsigned state.
 */
function readCallbackParams(searchParams: URLSearchParams) {
    const states = searchParams.getAll("state");
    const codes = searchParams.getAll("code");
    if (states.length !== 1 || codes.length !== 1 || !codes[0] || searchParams.has("error")) {
        return undefined;
    }

    const match = BROKER_CALLBACK_STATE_PATTERN.exec(states[0]);
    return match ? { transactionId: match[1], state: states[0], code: codes[0] } : undefined;
}

async function revokeUndelivered(accessToken: string, config: WooCommerceBrokerConfig) {
    if (!(await revokeAccessToken(accessToken, config))) {
        console.error("[OAuth broker] Undelivered credential revocation failed.");
    }
}

/** A terminal error page; it names no transaction, so nothing about it is shown or retried. */
function consentError(error: BrokerConsentError, setCookies: readonly string[] = []): Response {
    return redirectResponse(getBrokerConsentPageUrl({ error }), setCookies);
}

function storageUnavailable(operation: string, setCookies: readonly string[] = []): Response {
    console.error("[OAuth broker] Transaction storage is unavailable.", { operation });
    return consentError("unavailable", setCookies);
}
