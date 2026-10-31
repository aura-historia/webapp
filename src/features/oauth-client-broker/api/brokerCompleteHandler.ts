import { sha256Base64Url } from "@/features/oauth-client-broker/lib/brokerCrypto.ts";
import {
    BROKER_CLIENT_SECRET_VALUE_PATTERN,
    BROKER_PROTOCOL_VERSION,
    BROKER_RANDOM_VALUE_PATTERN,
} from "@/features/oauth-client-broker/lib/brokerProtocol.ts";
import {
    getBrokerTransaction,
    isWithinBrokerRateLimit,
} from "@/features/oauth-client-broker/server/brokerBindings.ts";
import {
    endpointErrorResponse,
    jsonResponse,
    readStrictJson,
} from "@/features/oauth-client-broker/server/brokerHttp.ts";
import type { CompletionResult } from "@/features/oauth-client-broker/server/brokerTransactionMachine.ts";

const COMPLETE_FIELDS = {
    protocol_version: "number",
    transaction_id: "string",
    completion_code: "string",
    completion_secret: "string",
} as const;

/**
 * Complete, WordPress server → broker. Releases the authoritative outcome at most once, and only
 * for the callback-delivered completion code together with the per-flow completion secret.
 */
export async function postWooCommerceBrokerComplete({ request }: { request: Request }) {
    if (!(await isWithinBrokerRateLimit(request, "complete"))) {
        return endpointErrorResponse("rate_limited");
    }

    const body = await readStrictJson(request, COMPLETE_FIELDS);
    if (
        body?.protocol_version === undefined ||
        !body.transaction_id ||
        !BROKER_RANDOM_VALUE_PATTERN.test(body.transaction_id) ||
        !body.completion_code ||
        !BROKER_RANDOM_VALUE_PATTERN.test(body.completion_code) ||
        !body.completion_secret ||
        !BROKER_CLIENT_SECRET_VALUE_PATTERN.test(body.completion_secret)
    ) {
        return endpointErrorResponse("invalid_request");
    }
    if (body.protocol_version !== BROKER_PROTOCOL_VERSION) {
        return endpointErrorResponse("unsupported_protocol_version");
    }

    const transaction = getBrokerTransaction(body.transaction_id);
    if (!transaction) {
        return endpointErrorResponse("server_error");
    }

    let result: CompletionResult;
    try {
        result = await transaction.complete({
            completionCodeHash: await sha256Base64Url(body.completion_code),
            completionSecretHash: await sha256Base64Url(body.completion_secret),
        });
    } catch {
        console.error("[OAuth broker] Transaction storage is unavailable.", {
            operation: "complete",
        });
        return endpointErrorResponse("temporarily_unavailable");
    }

    if (!result.ok) {
        return endpointErrorResponse(result.error);
    }
    return jsonResponse(toCompletionBody(result), 200);
}

function toCompletionBody(result: Extract<CompletionResult, { ok: true }>) {
    const common = {
        protocol_version: BROKER_PROTOCOL_VERSION,
        transaction_id: result.transactionId,
        client_state: result.clientState,
    };

    if (result.outcome.kind === "authorized" && result.credential && result.listingSourceId) {
        return {
            ...common,
            // The WooCommerce extension's name for an authorized result.
            outcome: "approved",
            listing_source_id: result.listingSourceId,
            access_token: result.credential.accessToken,
            token_type: result.credential.tokenType,
            scope: result.credential.scope,
            ...(result.resource === undefined ? {} : { resource: result.resource }),
            ...(result.credential.accessTokenExpiresAt === undefined
                ? {}
                : {
                      access_token_expires_at: new Date(
                          result.credential.accessTokenExpiresAt,
                      ).toISOString(),
                  }),
        };
    }

    return {
        ...common,
        outcome: result.outcome.kind === "denied" ? "denied" : "failed",
        error: result.outcome.kind === "failed" ? result.outcome.error : "access_denied",
    };
}
