import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    mapToCreateAccessTokenRequest,
    mapToUpdateAccessTokenRequest,
    type CreateAccessTokenInput,
    type UpdateAccessTokenInput,
} from "@/data/internal/access-tokens/AccessTokenRequests.ts";
export type {
    CreateAccessTokenInput,
    UpdateAccessTokenInput,
} from "@/data/internal/access-tokens/AccessTokenRequests.ts";
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
} from "@/data/internal/access-tokens/AccessToken.ts";
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

export function useCreateAccessToken() {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();

    return useMutation<CreatedAccessToken, Error, CreateAccessTokenInput>({
        gcTime: 0,
        mutationFn: async (input) => {
            const response = await postMyAccessToken({
                body: mapToCreateAccessTokenRequest(input),
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
            toast.error(error.message);
        },
    });
}

export function useUpdateAccessToken() {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();

    return useMutation<AccessToken, Error, UpdateAccessTokenInput>({
        mutationFn: async (input) => {
            const response = await patchMyAccessToken({
                body: mapToUpdateAccessTokenRequest(input),
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
            toast.error(error.message);
        },
    });
}
