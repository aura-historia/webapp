import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    deleteOAuthClient,
    patchOAuthClient,
    postOAuthClient,
    type AccessTokenScopeData,
    type OAuthClientMetadataPatchData,
} from "@/client";
import { mapToOAuthClient, type OAuthClient } from "@/data/internal/oauth/OAuthClient.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { toast } from "sonner";

export type CreateOAuthClientInput = {
    readonly clientName: string;
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
                    redirect_uris: input.redirectUris,
                    scope: input.scope,
                },
            });
            if (response.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(response.error)));
            }
            return mapToOAuthClient(response.data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "oauth-clients"] });
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "oauth-clients"] });
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "oauth-clients"] });
        },
        onError: (error) => {
            console.error("[useDeleteOAuthClient]", error);
            toast.error(error.message);
        },
    });
}
