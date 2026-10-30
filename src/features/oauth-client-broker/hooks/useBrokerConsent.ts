import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import {
    mapToOAuthBrokerConsent,
    type OAuthBrokerConsent,
} from "@/data/internal/oauth/OAuthBrokerConsent.ts";
import { WOOCOMMERCE_BROKER_CONSENT_PATH } from "@/features/oauth-client-broker/lib/brokerUrls.ts";

export class BrokerConsentUnavailableError extends Error {
    constructor() {
        super("OAuth broker consent is unavailable.");
    }
}

/** Reads the transaction's stored consent context; never cached, never retried silently. */
export function useBrokerConsent(transactionId: string): UseQueryResult<OAuthBrokerConsent> {
    return useQuery({
        queryKey: ["oauthBrokerConsent", transactionId],
        queryFn: async ({ signal }) => {
            const url = `${WOOCOMMERCE_BROKER_CONSENT_PATH}?${new URLSearchParams({
                transaction_id: transactionId,
            })}`;
            const response = await fetch(url, {
                credentials: "same-origin",
                cache: "no-store",
                signal,
            }).catch(() => {
                throw new BrokerConsentUnavailableError();
            });
            if (response.status >= 500 || response.status === 401) {
                throw new BrokerConsentUnavailableError();
            }
            return mapToOAuthBrokerConsent(await response.json().catch(() => undefined));
        },
        retry: false,
        staleTime: 0,
        gcTime: 0,
    });
}
