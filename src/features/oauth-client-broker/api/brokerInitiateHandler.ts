import { ACCESS_TOKEN_SCOPES } from "@/data/internal/access-tokens/AccessTokenScope.ts";
import {
    createRandomBase64Url,
    sha256Base64Url,
} from "@/features/oauth-client-broker/lib/brokerCrypto.ts";
import { validateMerchantRedirectUri } from "@/features/oauth-client-broker/lib/brokerMerchantRedirectUri.ts";
import {
    BROKER_CLIENT_SECRET_VALUE_PATTERN,
    BROKER_COMPLETION_CHALLENGE_METHOD,
    BROKER_MAX_RESOURCE_LENGTH,
    BROKER_PROTOCOL_VERSION,
    BROKER_RANDOM_VALUE_PATTERN,
    type BrokerEndpointError,
} from "@/features/oauth-client-broker/lib/brokerProtocol.ts";
import {
    getBrokerAuthorizationUrl,
    isLoopbackBrokerOrigin,
} from "@/features/oauth-client-broker/lib/brokerUrls.ts";
import {
    getBrokerTransaction,
    isWithinBrokerRateLimit,
} from "@/features/oauth-client-broker/server/brokerBindings.ts";
import { getWooCommerceBrokerConfig } from "@/features/oauth-client-broker/server/brokerConfig.ts";
import {
    endpointErrorResponse,
    jsonResponse,
    readStrictJson,
    type StrictJsonBody,
} from "@/features/oauth-client-broker/server/brokerHttp.ts";

const INITIATE_FIELDS = {
    protocol_version: "number",
    client_id: "string",
    merchant_redirect_uri: "string",
    client_state: "string",
    scope: "string",
    resource: "string",
    completion_challenge: "string",
    completion_challenge_method: "string",
} as const;

const KNOWN_SCOPES = new Set<string>(ACCESS_TOKEN_SCOPES);

/**
 * Initiate, WordPress server → broker. Registers a transaction and returns an opaque browser entry.
 * The broker fixes the client and callback from configuration and generates its own PKCE verifier;
 * nothing secret or readable about the transaction reaches the authorization URL.
 */
export async function postWooCommerceBrokerInitiate({ request }: { request: Request }) {
    if (!(await isWithinBrokerRateLimit(request, "initiate"))) {
        return endpointErrorResponse("rate_limited");
    }

    const body = await readStrictJson(request, INITIATE_FIELDS);
    if (!body) {
        return endpointErrorResponse("invalid_request");
    }

    const config = getWooCommerceBrokerConfig();
    if (!config) {
        return endpointErrorResponse("server_error");
    }

    const validation = validateInitiation(body, config.clientId);
    if (!validation.ok) {
        return endpointErrorResponse(validation.error);
    }

    const transactionId = createRandomBase64Url();
    const codeVerifier = createRandomBase64Url();
    const transaction = getBrokerTransaction(transactionId);
    if (!transaction) {
        return endpointErrorResponse("server_error");
    }

    try {
        const created = await transaction.create({
            transactionId,
            clientId: config.clientId,
            merchantRedirectUri: validation.value.merchantRedirectUri,
            clientState: validation.value.clientState,
            scope: validation.value.scope,
            ...(validation.value.resource === undefined
                ? {}
                : { resource: validation.value.resource }),
            completionChallenge: validation.value.completionChallenge,
            codeChallenge: await sha256Base64Url(codeVerifier),
            codeVerifier,
        });
        if (!created.ok) {
            return endpointErrorResponse("server_error");
        }

        return jsonResponse(
            {
                protocol_version: BROKER_PROTOCOL_VERSION,
                transaction_id: transactionId,
                authorization_url: getBrokerAuthorizationUrl({
                    transactionId,
                    clientId: config.clientId,
                    scope: validation.value.scope,
                }),
                expires_at: new Date(created.value.expiresAt).toISOString(),
            },
            201,
        );
    } catch {
        console.error("[OAuth broker] Transaction storage is unavailable.", {
            operation: "create",
        });
        return endpointErrorResponse("temporarily_unavailable");
    }
}

interface ValidInitiation {
    readonly merchantRedirectUri: string;
    readonly clientState: string;
    readonly scope: string;
    readonly resource?: string;
    readonly completionChallenge: string;
}

function validateInitiation(
    body: StrictJsonBody<typeof INITIATE_FIELDS>,
    clientId: string,
): { ok: true; value: ValidInitiation } | { ok: false; error: BrokerEndpointError } {
    if (body.protocol_version === undefined) return { ok: false, error: "invalid_request" };
    if (body.protocol_version !== BROKER_PROTOCOL_VERSION) {
        return { ok: false, error: "unsupported_protocol_version" };
    }
    if (body.client_id !== clientId) return { ok: false, error: "invalid_client" };

    const merchantRedirectUri =
        body.merchant_redirect_uri &&
        validateMerchantRedirectUri(body.merchant_redirect_uri, {
            allowLoopbackHttp: isLoopbackBrokerOrigin(),
        });
    if (!merchantRedirectUri) return { ok: false, error: "invalid_destination" };

    if (!body.client_state || !BROKER_CLIENT_SECRET_VALUE_PATTERN.test(body.client_state)) {
        return { ok: false, error: "invalid_request" };
    }
    if (!body.scope || !isSupportedScope(body.scope)) return { ok: false, error: "invalid_scope" };
    if (body.resource !== undefined && !isValidResource(body.resource)) {
        return { ok: false, error: "invalid_target" };
    }
    if (
        body.completion_challenge_method !== BROKER_COMPLETION_CHALLENGE_METHOD ||
        !body.completion_challenge ||
        !BROKER_RANDOM_VALUE_PATTERN.test(body.completion_challenge)
    ) {
        return { ok: false, error: "invalid_completion_challenge" };
    }

    return {
        ok: true,
        value: {
            merchantRedirectUri: merchantRedirectUri.toString(),
            clientState: body.client_state,
            scope: body.scope,
            ...(body.resource === undefined ? {} : { resource: body.resource }),
            completionChallenge: body.completion_challenge,
        },
    };
}

/** Canonical scopes, single-space separated, each once; forwarded exactly as sent. */
function isSupportedScope(scope: string): boolean {
    const scopes = scope.split(" ");
    return scopes.every((item) => KNOWN_SCOPES.has(item)) && new Set(scopes).size === scopes.length;
}

/** An absolute HTTPS resource indicator (RFC 8707); the backend decides which ones it accepts. */
function isValidResource(resource: string): boolean {
    if (resource.length === 0 || resource.length > BROKER_MAX_RESOURCE_LENGTH) return false;
    try {
        const url = new URL(resource);
        return url.protocol === "https:" && !url.hash && !url.username && !url.password;
    } catch {
        return false;
    }
}
