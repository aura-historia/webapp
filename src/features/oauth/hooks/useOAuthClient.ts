import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getOAuthClient } from "@/client";
import { mapToInternalOAuthClient, type OAuthClient } from "@/features/oauth/types/OAuthClient.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";

export function useOAuthClient(clientId: string | undefined): UseQueryResult<OAuthClient> {
    const { getErrorMessage } = useApiError();

    return useQuery({
        queryKey: ["oauthClient", clientId],
        queryFn: async () => {
            if (!clientId) {
                throw new Error("OAuth client id is required.");
            }

            const result = await getOAuthClient({
                path: { clientId },
            });

            if (result.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(result.error)));
            }

            return mapToInternalOAuthClient(result.data);
        },
        enabled: !!clientId,
        retry: false,
        staleTime: 5 * 60 * 1000,
    });
}
