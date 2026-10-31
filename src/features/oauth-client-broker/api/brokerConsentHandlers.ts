import { isSupportedLanguage, localizePathname } from "@/i18n/routing.ts";
import { getServerAuthIdentity } from "@/lib/server/amplify.server.ts";
import {
    createRandomBase64Url,
    sha256Base64Url,
} from "@/features/oauth-client-broker/lib/brokerCrypto.ts";
import {
    buildMerchantHandoffUrl,
    getMerchantSiteAddress,
} from "@/features/oauth-client-broker/lib/brokerMerchantRedirectUri.ts";
import {
    BROKER_RANDOM_VALUE_PATTERN,
    type BrokerConsentError,
} from "@/features/oauth-client-broker/lib/brokerProtocol.ts";
import {
    getBrokerAppOrigin,
    getBrokerConsentPageUrl,
    isLoopbackBrokerOrigin,
    isLoopbackHostname,
} from "@/features/oauth-client-broker/lib/brokerUrls.ts";
import {
    findGrantedListingSource,
    getRegisteredListingSourceUrl,
    requestAuthorizationCode,
} from "@/features/oauth-client-broker/server/brokerBackend.ts";
import { getBrokerTransaction } from "@/features/oauth-client-broker/server/brokerBindings.ts";
import { getWooCommerceBrokerConfig } from "@/features/oauth-client-broker/server/brokerConfig.ts";
import {
    createSessionBindingCookie,
    isSameOriginSubmission,
    jsonResponse,
    readStrictForm,
    redirectResponse,
    textResponse,
} from "@/features/oauth-client-broker/server/brokerHttp.ts";
import type { BrokerConsentContext } from "@/features/oauth-client-broker/server/brokerTransactionMachine.ts";

const LISTING_SOURCE_ID_PATTERN = /^ls_[0-9a-z]{26}$/;
const DECISION_FIELDS = ["lng", "transaction_id", "listing_source_id"] as const;
const LOGIN_PATH = "/login";
const AUTHORIZE_PAGE_PATH = "/oauth/authorize";

type SignedInIdentity = NonNullable<Awaited<ReturnType<typeof getServerAuthIdentity>>>;

/**
 * Consent context for the signed-in consent page: only what the page shows. Reading never
 * approves, binds or extends a transaction.
 */
export async function getWooCommerceBrokerConsent({ request }: { request: Request }) {
    const transactionId = new URL(request.url).searchParams.getAll("transaction_id");
    if (transactionId.length !== 1 || !BROKER_RANDOM_VALUE_PATTERN.test(transactionId[0])) {
        return jsonResponse({ status: "invalid" }, 400);
    }
    if (!(await getServerAuthIdentity())) {
        return jsonResponse({ status: "unauthenticated" }, 401);
    }

    const transaction = getBrokerTransaction(transactionId[0]);
    if (!transaction) {
        return jsonResponse({ status: "unavailable" }, 503);
    }

    try {
        const view = await transaction.getConsentView();
        if (view.status !== "pending") {
            return jsonResponse({ status: view.status }, 200);
        }
        return jsonResponse(
            {
                status: "pending",
                transaction_id: view.context.transactionId,
                client_id: view.context.clientId,
                merchant_redirect_uri: view.context.merchantRedirectUri,
                recipient: getMerchantSiteAddress(view.context.merchantRedirectUri),
                scope: view.context.scope,
                ...(view.context.resource === undefined ? {} : { resource: view.context.resource }),
                expires_at: new Date(view.context.expiresAt).toISOString(),
            },
            200,
        );
    } catch {
        console.error("[OAuth broker] Transaction storage is unavailable.", {
            operation: "consent",
        });
        return jsonResponse({ status: "unavailable" }, 503);
    }
}

/**
 * Approve, consent page → broker. Rechecks the source grant and the recipient's registration,
 * asks the backend for a code, freezes the approval and binds the callback to this browser.
 */
export async function postWooCommerceBrokerApprove({ request }: { request: Request }) {
    const decision = await readDecision(request);
    if (decision instanceof Response) return decision;
    if (!decision.listingSourceId) {
        return consentRedirect(decision, "source_unavailable");
    }

    const identity = await getServerAuthIdentity();
    if (!identity) return loginRedirect(decision);

    const pending = await loadPendingContext(decision);
    if (pending instanceof Response) return pending;
    const { transaction, context, config } = pending;

    const destination = await verifyDestination(identity, decision.listingSourceId, context);
    if (destination === "unauthenticated") return loginRedirect(decision);
    if (destination !== "authorized") return consentRedirect(decision, destination);

    const callbackState = `${decision.transactionId}.${createRandomBase64Url()}`;
    const sessionBinding = createRandomBase64Url();
    const authorization = await requestAuthorizationCode({
        accessToken: identity.accessToken,
        config,
        scope: context.scope,
        ...(context.resource === undefined ? {} : { resource: context.resource }),
        state: callbackState,
        codeChallenge: context.codeChallenge,
    });

    if (!authorization.ok) {
        if (authorization.kind !== "rejected") {
            return authorization.kind === "unauthenticated"
                ? loginRedirect(decision)
                : consentRedirect(decision, "approval_failed");
        }
        // The backend refused the request itself; the verified recipient learns why.
        return answerWithHandoff(decision, transaction, {
            outcome: { kind: "failed", error: authorization.error },
            listingSourceId: decision.listingSourceId,
        });
    }

    try {
        const approved = await transaction.approve({
            userSub: identity.userSub,
            sessionBindingHash: await sha256Base64Url(sessionBinding),
            callbackStateHash: await sha256Base64Url(callbackState),
            listingSourceId: decision.listingSourceId,
        });
        if (!approved.ok) {
            // Another tab answered first; this code is never redeemed and expires.
            return consentRedirect(decision);
        }
    } catch {
        return storageUnavailable(decision, "approve");
    }

    const callbackUrl = new URL(config.callbackUrl);
    callbackUrl.searchParams.set("code", authorization.code);
    callbackUrl.searchParams.set("state", callbackState);
    return redirectResponse(callbackUrl.toString(), [
        createSessionBindingCookie(
            decision.transactionId,
            sessionBinding,
            (context.expiresAt - Date.now()) / 1000,
        ),
    ]);
}

/**
 * Deny, consent page → broker. Records the denial server-side; no code or token is requested.
 * The merchant learns the outcome only when the selected source verifies its recipient.
 */
export async function postWooCommerceBrokerDeny({ request }: { request: Request }) {
    const decision = await readDecision(request);
    if (decision instanceof Response) return decision;

    const identity = await getServerAuthIdentity();
    if (!identity) return loginRedirect(decision);

    const pending = await loadPendingContext(decision);
    if (pending instanceof Response) return pending;
    const { transaction, context } = pending;

    const destination = decision.listingSourceId
        ? await verifyDestination(identity, decision.listingSourceId, context)
        : undefined;
    if (destination === "unauthenticated") return loginRedirect(decision);

    if (destination === "authorized") {
        return answerWithHandoff(decision, transaction, {
            outcome: { kind: "denied" },
            listingSourceId: decision.listingSourceId,
        });
    }

    try {
        const denied = await transaction.answerBeforeApproval({ outcome: { kind: "denied" } });
        return consentRedirect(decision, denied.ok ? undefined : "invalid_request");
    } catch {
        return storageUnavailable(decision, "deny");
    }
}

interface ConsentDecision {
    readonly lng?: string;
    readonly transactionId: string;
    readonly listingSourceId?: string;
}

async function readDecision(request: Request): Promise<ConsentDecision | Response> {
    if (!isSameOriginSubmission(request)) {
        return textResponse("Cross-origin OAuth authorization request rejected.", 403);
    }

    const form = await readStrictForm(request, DECISION_FIELDS);
    const lng = form?.lng && isSupportedLanguage(form.lng) ? form.lng : undefined;
    if (
        !form?.transaction_id ||
        !BROKER_RANDOM_VALUE_PATTERN.test(form.transaction_id) ||
        (form.listing_source_id !== undefined &&
            !LISTING_SOURCE_ID_PATTERN.test(form.listing_source_id))
    ) {
        return redirectResponse(getBrokerConsentPageUrl({ lng, error: "invalid_request" }));
    }

    return {
        ...(lng === undefined ? {} : { lng }),
        transactionId: form.transaction_id,
        ...(form.listing_source_id === undefined
            ? {}
            : { listingSourceId: form.listing_source_id }),
    };
}

async function loadPendingContext(decision: ConsentDecision) {
    const config = getWooCommerceBrokerConfig();
    const transaction = getBrokerTransaction(decision.transactionId);
    if (!config || !transaction) {
        return consentRedirect(decision, "unavailable");
    }

    try {
        const view = await transaction.getConsentView();
        // Answered, declined or unknown: the consent page shows that state.
        if (view.status !== "pending") return consentRedirect(decision);
        return { config, transaction, context: view.context };
    } catch {
        return storageUnavailable(decision, "consent");
    }
}

type DestinationCheck =
    | "authorized"
    | "unauthenticated"
    | Extract<
          BrokerConsentError,
          "source_unavailable" | "recipient_not_registered" | "approval_failed"
      >;

/**
 * The destination rule: the selected source must still be granted to this user, and the website
 * an administrator registered for it must have exactly the recipient's origin.
 */
async function verifyDestination(
    identity: SignedInIdentity,
    listingSourceId: string,
    context: BrokerConsentContext,
): Promise<DestinationCheck> {
    const grant = await findGrantedListingSource({
        accessToken: identity.accessToken,
        listingSourceId,
    });
    if (!grant.ok) {
        if (grant.kind === "unauthenticated") return "unauthenticated";
        return grant.kind === "not_granted" ? "source_unavailable" : "approval_failed";
    }

    const registered = await getRegisteredListingSourceUrl({
        accessToken: identity.accessToken,
        listingSourceSlugId: grant.source.listingSourceSlugId,
    });
    if (!registered.ok) {
        return registered.kind === "unauthenticated" ? "unauthenticated" : "approval_failed";
    }

    return isRegisteredRecipient(registered.url, context.merchantRedirectUri)
        ? "authorized"
        : "recipient_not_registered";
}

/**
 * The registered website must be the WordPress site the plugin runs at: the same origin and the
 * same install path. A sibling path on a shared origin, or any other page, is not the recipient.
 */
function isRegisteredRecipient(
    registeredUrl: string | undefined,
    merchantRedirectUri: string,
): boolean {
    if (!registeredUrl) return false;
    let registered: URL;
    try {
        registered = new URL(registeredUrl);
    } catch {
        return false;
    }
    const secure =
        registered.protocol === "https:" ||
        (isLoopbackBrokerOrigin() &&
            registered.protocol === "http:" &&
            isLoopbackHostname(registered.hostname));
    const path = registered.pathname.endsWith("/")
        ? registered.pathname
        : `${registered.pathname}/`;
    return secure && `${registered.origin}${path}` === getMerchantSiteAddress(merchantRedirectUri);
}

async function answerWithHandoff(
    decision: ConsentDecision,
    transaction: NonNullable<ReturnType<typeof getBrokerTransaction>>,
    params: Parameters<
        NonNullable<ReturnType<typeof getBrokerTransaction>>["answerBeforeApproval"]
    >[0],
): Promise<Response> {
    const completionCode = createRandomBase64Url();
    try {
        const answered = await transaction.answerBeforeApproval({
            ...params,
            completionCodeHash: await sha256Base64Url(completionCode),
        });
        if (!answered.ok) return consentRedirect(decision);
        return redirectResponse(
            buildMerchantHandoffUrl(answered.value.merchantRedirectUri, {
                transactionId: decision.transactionId,
                clientState: answered.value.clientState,
                completionCode,
            }),
        );
    } catch {
        return storageUnavailable(decision, "answer");
    }
}

function consentRedirect(decision: ConsentDecision, error?: BrokerConsentError): Response {
    return redirectResponse(
        getBrokerConsentPageUrl({
            transactionId: decision.transactionId,
            ...(error === undefined ? {} : { error }),
            ...(decision.lng === undefined ? {} : { lng: decision.lng }),
        }),
    );
}

function storageUnavailable(decision: ConsentDecision, operation: string): Response {
    console.error("[OAuth broker] Transaction storage is unavailable.", { operation });
    return consentRedirect(decision, "unavailable");
}

/** Sign-in returns to the same transaction; the choice of source is made again afterwards. */
function loginRedirect(decision: ConsentDecision): Response {
    const lng = decision.lng ?? "en";
    const consentPath = `${localizePathname(AUTHORIZE_PAGE_PATH, lng)}?${new URLSearchParams({
        transaction_id: decision.transactionId,
    })}`;
    const loginUrl = new URL(localizePathname(LOGIN_PATH, lng), getBrokerAppOrigin());
    loginUrl.searchParams.set("redirect", consentPath);
    return redirectResponse(loginUrl.toString());
}
