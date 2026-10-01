import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getOAuthConsentClient } from "@/features/oauth/api/oauthConsentMetadata.ts";
import type { OAuthClient } from "@/features/oauth/types/OAuthClient.ts";

export function useOAuthClient(clientId: string | undefined): UseQueryResult<OAuthClient> {
    return useQuery({
        queryKey: ["oauthClient", clientId],
        queryFn: async () => {
            if (!clientId) {
                throw new Error("OAuth client id is required.");
            }

            return getOAuthConsentClient(clientId);
        },
        enabled: !!clientId,
        retry: false,
        staleTime: 0,
        gcTime: 0,
    });
}
