import { useQuery } from "@tanstack/react-query";
import { getMyAccessTokens } from "@/client";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import {
    mapToAccessToken,
    type AccessToken,
} from "@/features/partner/access-token-management/types/AccessToken.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";

export const ACCESS_TOKENS_QUERY_KEY = ["access-tokens"] as const;

export function useAccessTokens() {
    const { getErrorMessage } = useApiError();

    return useQuery<AccessToken[]>({
        queryKey: ACCESS_TOKENS_QUERY_KEY,
        queryFn: async () => {
            const response = await getMyAccessTokens();
            if (response.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(response.error)));
            }

            return response.data
                .map(mapToAccessToken)
                .sort((first, second) => second.created.getTime() - first.created.getTime());
        },
        staleTime: 30 * 1000,
    });
}
