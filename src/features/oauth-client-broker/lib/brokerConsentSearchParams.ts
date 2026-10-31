import { z } from "zod";
import {
    BROKER_CONSENT_ERRORS,
    BROKER_RANDOM_VALUE_PATTERN,
} from "@/features/oauth-client-broker/lib/brokerProtocol.ts";
import { getWooCommerceBrokerCallbackUrl } from "@/features/oauth-client-broker/lib/brokerUrls.ts";

/**
 * Consent page search of a WooCommerce broker transaction: the opaque reference and a reason to
 * show. Every protocol value comes from the stored transaction, never from the URL.
 */
export const brokerConsentSearchSchema = z.object({
    transaction_id: z.string().optional(),
    // An unknown reason is dropped rather than failing the page.
    broker_error: z.enum(BROKER_CONSENT_ERRORS).optional().catch(undefined),
});

export type BrokerConsentSearchParams = z.infer<typeof brokerConsentSearchSchema>;

const BROKER_ENTRY_PARAMETERS = ["client_id", "redirect_uri", "response_type", "scope", "state"];

/**
 * The transaction reference of the browser entry initiation returns (`getBrokerAuthorizationUrl`),
 * or `undefined`. Only that exact shape counts: these parameters and no others, the broker callback
 * of this deployment and a `state` shaped like a transaction reference. Any other request for the
 * broker callback stays a direct OAuth request, which the consent page refuses.
 *
 * The router merges the validated search back into the location, so the sign-in return and the
 * language switch carry the entry with `transaction_id` added; it is accepted only as `state`.
 */
export function getBrokerEntryTransactionId(search: Record<string, unknown>): string | undefined {
    const keys = Object.keys(search).filter((key) => key !== "transaction_id");
    if (
        keys.length !== BROKER_ENTRY_PARAMETERS.length ||
        !BROKER_ENTRY_PARAMETERS.every((key) => keys.includes(key))
    ) {
        return undefined;
    }

    const { client_id, redirect_uri, response_type, scope, state } = search;
    if (
        typeof client_id !== "string" ||
        typeof scope !== "string" ||
        response_type !== "code" ||
        redirect_uri !== getWooCommerceBrokerCallbackUrl() ||
        typeof state !== "string" ||
        !BROKER_RANDOM_VALUE_PATTERN.test(state) ||
        ("transaction_id" in search && search.transaction_id !== state)
    ) {
        return undefined;
    }
    return state;
}

/**
 * The search of a broker transaction page, or `undefined` for a direct OAuth request. A page
 * carries either the broker's browser entry or only the reference and a reason.
 */
export function parseBrokerConsentSearch(
    search: Record<string, unknown>,
): BrokerConsentSearchParams | undefined {
    const entryTransactionId = getBrokerEntryTransactionId(search);
    if (entryTransactionId !== undefined) {
        return { transaction_id: entryTransactionId };
    }
    if (!("client_id" in search) && ("transaction_id" in search || "broker_error" in search)) {
        return brokerConsentSearchSchema.parse(search);
    }
    return undefined;
}
