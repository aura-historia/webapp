import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getMyListingSources } from "@/client";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";

import {
    mapToOAuthListingSource,
    type OAuthListingSource,
} from "@/data/internal/oauth/OAuthListingSource.ts";
export type { OAuthListingSource } from "@/data/internal/oauth/OAuthListingSource.ts";

export function useOAuthListingSources(enabled: boolean): UseQueryResult<OAuthListingSource[]> {
    const { getErrorMessage } = useApiError();

    return useQuery({
        queryKey: ["oauthListingSources"],
        queryFn: async () => {
            const response = await getMyListingSources({ cache: "no-store" });

            if (response.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(response.error)));
            }

            return response.data.map(mapToOAuthListingSource);
        },
        enabled,
        retry: false,
        staleTime: 0,
        gcTime: 0,
    });
}
