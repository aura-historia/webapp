import { z } from "zod";
import { BROKER_CONSENT_ERRORS } from "@/features/oauth-client-broker/lib/brokerProtocol.ts";

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

/** A broker transaction page, as opposed to a direct OAuth authorization request. */
export function isBrokerConsentSearch(search: Record<string, unknown>): boolean {
    return !("client_id" in search) && ("transaction_id" in search || "broker_error" in search);
}
