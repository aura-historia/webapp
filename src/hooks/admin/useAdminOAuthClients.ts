import { useQuery } from "@tanstack/react-query";
import { getOAuthClients } from "@/client";
import { mapToOAuthClient, type OAuthClient } from "@/data/internal/oauth/OAuthClient.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";

export function useAdminOAuthClients() {
    const { getErrorMessage } = useApiError();

    return useQuery<OAuthClient[]>({
        queryKey: ["admin", "oauth-clients"],
        queryFn: async () => {
            const response = await getOAuthClients();
            if (response.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(response.error)));
            }
            return response.data.map(mapToOAuthClient);
        },
        staleTime: 30 * 1000,
    });
}
