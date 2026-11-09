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
    disconnectMyOAuthClient,
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
import {
    mapToOwnCredentials,
    type OwnCredentials,
} from "@/data/internal/access-tokens/OwnCredentials.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { toast } from "sonner";

export const ACCESS_TOKENS_QUERY_KEY = ["access-tokens"] as const;

/** Personal access tokens and connected apps: one listing, one cache entry. */
export function useOwnCredentials<Selected = OwnCredentials>(
    select?: (credentials: OwnCredentials) => Selected,
) {
    const { getErrorMessage } = useApiError();

    return useQuery<OwnCredentials, Error, Selected>({
        queryKey: ACCESS_TOKENS_QUERY_KEY,
        queryFn: async () => {
            const response = await getMyAccessTokens();
            if (response.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(response.error)));
            }

            return mapToOwnCredentials(response.data);
        },
        select,
        staleTime: 30 * 1000,
    });
}

const selectPersonalTokens = (credentials: OwnCredentials) => credentials.personalTokens;

/** Only the tokens the user created and manages one by one. */
export function useAccessTokens() {
    return useOwnCredentials(selectPersonalTokens);
}

function updatePersonalTokens(
    credentials: OwnCredentials | undefined,
    update: (personalTokens: AccessToken[]) => AccessToken[],
): OwnCredentials | undefined {
    return credentials && { ...credentials, personalTokens: update(credentials.personalTokens) };
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
            queryClient.setQueryData<OwnCredentials>(ACCESS_TOKENS_QUERY_KEY, (credentials) =>
                updatePersonalTokens(credentials, (accessTokens) =>
                    accessTokens.map((accessToken) =>
                        accessToken.id === updatedAccessToken.id ? updatedAccessToken : accessToken,
                    ),
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
            queryClient.setQueryData<OwnCredentials>(ACCESS_TOKENS_QUERY_KEY, (credentials) =>
                updatePersonalTokens(credentials, (accessTokens) =>
                    accessTokens.filter((accessToken) => accessToken.id !== deletedId),
                ),
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
            queryClient.setQueryData<OwnCredentials>(ACCESS_TOKENS_QUERY_KEY, (credentials) =>
                updatePersonalTokens(credentials, () => []),
            );
        },
        onError: (error) => {
            void queryClient.invalidateQueries({ queryKey: ACCESS_TOKENS_QUERY_KEY });
            toast.error(error.message);
        },
    });
}

/**
 * Revokes every credential the user holds for one OAuth client (`client.clientId`): an agent's
 * connection with its tokens, or every token issued to a registered client.
 */
export function useDisconnectConnectedApp() {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();

    return useMutation<void, Error, string>({
        mutationFn: async (clientId) => {
            const response = await disconnectMyOAuthClient({ query: { clientId } });
            if (response.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(response.error)));
            }
        },
        onSuccess: (_, clientId) => {
            queryClient.setQueryData<OwnCredentials>(
                ACCESS_TOKENS_QUERY_KEY,
                (credentials) =>
                    credentials && {
                        ...credentials,
                        connectedApps: credentials.connectedApps.filter(
                            (app) => app.client.clientId !== clientId,
                        ),
                    },
            );
        },
    });
}
