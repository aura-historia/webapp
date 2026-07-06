import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AccessTokenScopeData } from "@/client";
import {
    deleteMyAccessToken,
    getMyAccessTokens,
    patchMyAccessToken,
    postMyAccessToken,
} from "@/client";
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

export type UpdateAccessTokenInput = {
    readonly id: string;
    readonly name: string;
    readonly scopes: AccessTokenScopeData[];
    readonly expiresAt?: Date;
};

export function useUpdateAccessToken() {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();

    return useMutation<AccessToken, Error, UpdateAccessTokenInput>({
        mutationFn: async ({ id, name, scopes, expiresAt }) => {
            const response = await patchMyAccessToken({
                body: {
                    accessTokenId: id,
                    name,
                    scope: scopes,
                    expiresAt: expiresAt?.toISOString(),
                },
            });
            if (response.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(response.error)));
            }

            return mapToAccessToken(response.data);
        },
        onSuccess: (updatedAccessToken) => {
            queryClient.setQueryData<AccessToken[]>(ACCESS_TOKENS_QUERY_KEY, (accessTokens) =>
                accessTokens?.map((accessToken) =>
                    accessToken.id === updatedAccessToken.id ? updatedAccessToken : accessToken,
                ),
            );
        },
        onError: (error) => {
            console.error("[useUpdateAccessToken]", error);
            toast.error(error.message);
        },
    });
}

async function deleteAccessToken(
    id: string,
    getErrorMessage: ReturnType<typeof useApiError>["getErrorMessage"],
) {
    const response = await deleteMyAccessToken({
        path: { accessTokenId: id },
    });
    if (response.error) {
        throw new Error(getErrorMessage(mapToInternalApiError(response.error)));
    }
}

export function useDeleteAccessToken() {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();

    return useMutation<void, Error, string>({
        mutationFn: (id) => deleteAccessToken(id, getErrorMessage),
        onSuccess: (_, deletedId) => {
            queryClient.setQueryData<AccessToken[]>(ACCESS_TOKENS_QUERY_KEY, (accessTokens) =>
                accessTokens?.filter((accessToken) => accessToken.id !== deletedId),
            );
        },
        onError: (error) => {
            console.error("[useDeleteAccessToken]", error);
            toast.error(error.message);
        },
    });
}

export function useDeleteAllAccessTokens() {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();

    return useMutation<void, Error, readonly string[]>({
        mutationFn: async (ids) => {
            await Promise.all(ids.map((id) => deleteAccessToken(id, getErrorMessage)));
        },
        onSuccess: () => {
            queryClient.setQueryData<AccessToken[]>(ACCESS_TOKENS_QUERY_KEY, []);
        },
        onError: (error) => {
            void queryClient.invalidateQueries({ queryKey: ACCESS_TOKENS_QUERY_KEY });
            console.error("[useDeleteAllAccessTokens]", error);
            toast.error(error.message);
        },
    });
}
