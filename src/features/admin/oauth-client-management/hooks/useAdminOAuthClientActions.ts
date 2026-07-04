import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    deleteOAuthClient,
    patchOAuthClient,
    postOAuthClient,
    type AccessTokenScopeData,
    type OAuthClientMetadataPatchData,
} from "@/client";
import {
    mapToOAuthClient,
    type OAuthClient,
} from "@/features/admin/oauth-client-management/types/OAuthClient.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { toast } from "sonner";

const ADMIN_OAUTH_CLIENTS_QUERY_KEY = ["admin", "oauth-clients"] as const;

function upsertOAuthClient(
    existingClients: OAuthClient[] | undefined,
    client: OAuthClient,
): OAuthClient[] {
    const clientsWithoutMatch = (existingClients ?? []).filter(
        (entry) => entry.clientId !== client.clientId,
    );

    return [client, ...clientsWithoutMatch];
}

export type CreateOAuthClientInput = {
    readonly clientName: string;
    readonly tosUri: string;
    readonly policyUri: string;
    readonly clientUri: string;
    readonly logoUri: string;
    readonly redirectUris: string[];
    readonly scope?: AccessTokenScopeData[];
};

export function useCreateOAuthClient() {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();

    return useMutation<OAuthClient, Error, CreateOAuthClientInput>({
        mutationFn: async (input) => {
            const response = await postOAuthClient({
                body: {
                    client_name: input.clientName,
                    tos_uri: input.tosUri,
                    policy_uri: input.policyUri,
                    client_uri: input.clientUri,
                    logo_uri: input.logoUri,
                    redirect_uris: input.redirectUris,
                    scope: input.scope,
                },
            });
            if (response.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(response.error)));
            }
            return mapToOAuthClient(response.data);
        },
        onSuccess: (client) => {
            queryClient.setQueryData<OAuthClient[]>(ADMIN_OAUTH_CLIENTS_QUERY_KEY, (existing) =>
                upsertOAuthClient(existing, client),
            );
            queryClient.invalidateQueries({ queryKey: ADMIN_OAUTH_CLIENTS_QUERY_KEY });
        },
        onError: (error) => {
            console.error("[useCreateOAuthClient]", error);
            toast.error(error.message);
        },
    });
}

export type PatchOAuthClientInput = {
    readonly clientId: string;
    readonly clientName?: string;
    readonly tosUri?: string;
    readonly policyUri?: string;
    readonly clientUri?: string;
    readonly logoUri?: string;
    readonly redirectUris?: string[];
    readonly scope?: AccessTokenScopeData[];
};

export function usePatchOAuthClient() {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();

    return useMutation<OAuthClient, Error, PatchOAuthClientInput>({
        mutationFn: async ({ clientId, ...rest }) => {
            const body: OAuthClientMetadataPatchData = {};
            if (rest.clientName !== undefined) body.client_name = rest.clientName;
            if (rest.tosUri !== undefined) body.tos_uri = rest.tosUri;
            if (rest.policyUri !== undefined) body.policy_uri = rest.policyUri;
            if (rest.clientUri !== undefined) body.client_uri = rest.clientUri;
            if (rest.logoUri !== undefined) body.logo_uri = rest.logoUri;
            if (rest.redirectUris !== undefined) body.redirect_uris = rest.redirectUris;
            if (rest.scope !== undefined) body.scope = rest.scope;

            const response = await patchOAuthClient({
                path: { clientId },
                body,
            });
            if (response.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(response.error)));
            }
            return mapToOAuthClient(response.data);
        },
        onSuccess: (client) => {
            queryClient.setQueryData<OAuthClient[]>(ADMIN_OAUTH_CLIENTS_QUERY_KEY, (existing) =>
                upsertOAuthClient(existing, client),
            );
            queryClient.invalidateQueries({ queryKey: ADMIN_OAUTH_CLIENTS_QUERY_KEY });
        },
        onError: (error) => {
            console.error("[usePatchOAuthClient]", error);
            toast.error(error.message);
        },
    });
}

export function useDeleteOAuthClient() {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();

    return useMutation<void, Error, string>({
        mutationFn: async (clientId) => {
            const response = await deleteOAuthClient({
                path: { clientId },
            });
            if (response.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(response.error)));
            }
        },
        onSuccess: (_, clientId) => {
            queryClient.setQueryData<OAuthClient[]>(ADMIN_OAUTH_CLIENTS_QUERY_KEY, (existing) =>
                (existing ?? []).filter((client) => client.clientId !== clientId),
            );
            queryClient.invalidateQueries({ queryKey: ADMIN_OAUTH_CLIENTS_QUERY_KEY });
        },
        onError: (error) => {
            console.error("[useDeleteOAuthClient]", error);
            toast.error(error.message);
        },
    });
}
