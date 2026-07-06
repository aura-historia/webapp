import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AccessTokenScopeData } from "@/client";
import { getMyAccessTokens, postMyAccessToken } from "@/client";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import {
    mapToAccessToken,
    mapToCreatedAccessToken,
    type AccessToken,
    type CreatedAccessToken,
} from "@/features/partner/access-token-management/types/AccessToken.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { toast } from "sonner";

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

export type CreateAccessTokenInput = {
    readonly name: string;
    readonly scopes: AccessTokenScopeData[];
    readonly expiresAt?: Date;
};

export function useCreateAccessToken() {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();

    return useMutation<CreatedAccessToken, Error, CreateAccessTokenInput>({
        mutationFn: async ({ name, scopes, expiresAt }) => {
            const response = await postMyAccessToken({
                body: {
                    name,
                    scope: scopes.length > 0 ? scopes : undefined,
                    expiresAt: expiresAt?.toISOString(),
                },
            });
            if (response.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(response.error)));
            }

            return mapToCreatedAccessToken(response.data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ACCESS_TOKENS_QUERY_KEY });
        },
        onError: (error) => {
            console.error("[useCreateAccessToken]", error);
            toast.error(error.message);
        },
    });
}
