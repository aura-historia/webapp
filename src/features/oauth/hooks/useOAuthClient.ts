import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import {
    getOAuthConsentClient,
    getOAuthMetadataDocumentConsentClient,
} from "@/features/oauth/api/oauthConsentMetadata.ts";
import {
    isMetadataDocumentClientId,
    type OAuthConsentClient,
} from "@/data/internal/oauth/OAuthClient.ts";

/**
 * Consent metadata for the requested client. A metadata document client (an HTTPS `client_id`) is
 * read together with the request's callback, which the backend must find in its document; a
 * registered client is read by its ID alone and its registered callbacks are compared locally.
 */
export function useOAuthClient(
    clientId: string | undefined,
    redirectUri?: string,
): UseQueryResult<OAuthConsentClient> {
    const isMetadataDocumentClient = clientId !== undefined && isMetadataDocumentClientId(clientId);

    return useQuery<OAuthConsentClient>({
        queryKey: isMetadataDocumentClient
            ? ["oauthClient", clientId, redirectUri]
            : ["oauthClient", clientId],
        queryFn: async () => {
            if (!clientId) {
                throw new Error("OAuth client id is required.");
            }
            if (!isMetadataDocumentClient) {
                return getOAuthConsentClient(clientId);
            }
            if (redirectUri === undefined) {
                throw new Error("A metadata document client needs the requested redirect URI.");
            }

            return getOAuthMetadataDocumentConsentClient(clientId, redirectUri);
        },
        enabled: !!clientId,
        retry: false,
        staleTime: 0,
        gcTime: 0,
    });
}
