import {
    infiniteQueryOptions,
    queryOptions,
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import {
    adminCreateOAuthClient,
    adminDeleteOAuthClient,
    adminGetOAuthClient,
    adminListOAuthClients,
    adminPatchOAuthClient,
} from "@/client";
import {
    buildAdminOAuthClientCreateData,
    buildAdminOAuthClientPatchData,
    mapToAdminOAuthClient,
    mapToAdminOAuthClientListQuery,
    mapToAdminOAuthClientPage,
    mapToCreatedAdminOAuthClient,
    type AdminOAuthClient,
    type AdminOAuthClientCursor,
    type AdminOAuthClientFilters,
    type AdminOAuthClientMetadataInput,
    type AdminOAuthClientPage,
} from "@/data/internal/admin/AdminOAuthClient.ts";

export const ADMIN_OAUTH_CLIENTS_QUERY_KEY = ["admin", "oauth-clients"] as const;
export const adminOAuthClientListQueryKey = (filters: AdminOAuthClientFilters) =>
    [...ADMIN_OAUTH_CLIENTS_QUERY_KEY, "list", filters] as const;
export const adminOAuthClientDetailQueryKey = (clientId?: string) =>
    [...ADMIN_OAUTH_CLIENTS_QUERY_KEY, "detail", clientId] as const;

type AdminOAuthClientOperation = "list" | "detail" | "create" | "update" | "delete";

export class AdminOAuthClientRequestError extends Error {
    constructor(
        message: string,
        readonly status: number,
    ) {
        super(message);
        this.name = "AdminOAuthClientRequestError";
    }
}

export function createAdminOAuthClientErrorFactory(t: TFunction) {
    return (status: number | undefined, _operation: AdminOAuthClientOperation) => {
        const safeStatus = status ?? 500;
        let key: string;
        if (safeStatus === 401 || safeStatus === 403) {
            key = "adminOAuthClients.errors.forbidden";
        } else if (safeStatus === 404) {
            key = "adminOAuthClients.errors.missing";
        } else if (safeStatus === 409) {
            key = "adminOAuthClients.errors.conflict";
        } else if (safeStatus === 400) {
            key = "adminOAuthClients.errors.invalid";
        } else {
            key = "adminOAuthClients.errors.requestFailed";
        }
        // API error details are deliberately discarded; admin OAuth metadata must not leak in UI.
        return new AdminOAuthClientRequestError(t(key), safeStatus);
    };
}

type AdminOAuthClientErrorFactory = ReturnType<typeof createAdminOAuthClientErrorFactory>;

function useAdminOAuthClientError() {
    const { t } = useTranslation();
    return createAdminOAuthClientErrorFactory(t);
}

export function adminOAuthClientListQueryOptions(
    filters: AdminOAuthClientFilters,
    requestError: AdminOAuthClientErrorFactory,
) {
    return infiniteQueryOptions({
        queryKey: adminOAuthClientListQueryKey(filters),
        initialPageParam: undefined as AdminOAuthClientCursor | undefined,
        getNextPageParam: (page: AdminOAuthClientPage) => page.searchAfter ?? undefined,
        staleTime: 0,
        gcTime: 60_000,
        queryFn: async ({ pageParam, signal }) => {
            const response = await adminListOAuthClients({
                query: mapToAdminOAuthClientListQuery(filters, pageParam),
                signal,
                cache: "no-store",
            });
            if (response.error || !response.data) {
                throw requestError(response.response?.status, "list");
            }
            return mapToAdminOAuthClientPage(response.data);
        },
    });
}

export function adminOAuthClientDetailQueryOptions(
    clientId: string,
    requestError: AdminOAuthClientErrorFactory,
) {
    return queryOptions({
        queryKey: adminOAuthClientDetailQueryKey(clientId),
        staleTime: 0,
        gcTime: 60_000,
        queryFn: async ({ signal }) => {
            const response = await adminGetOAuthClient({
                path: { clientId },
                signal,
                cache: "no-store",
            });
            if (response.error || !response.data) {
                throw requestError(response.response?.status, "detail");
            }
            return mapToAdminOAuthClient(response.data);
        },
    });
}

export function useAdminOAuthClients(filters: AdminOAuthClientFilters) {
    const requestError = useAdminOAuthClientError();
    return useInfiniteQuery(adminOAuthClientListQueryOptions(filters, requestError));
}

export function useAdminOAuthClient(clientId?: string, enabled = true) {
    const requestError = useAdminOAuthClientError();
    return useQuery({
        ...adminOAuthClientDetailQueryOptions(clientId ?? "", requestError),
        enabled: enabled && Boolean(clientId),
    });
}

function useAdminOAuthClientListReset() {
    const queryClient = useQueryClient();
    return () => queryClient.resetQueries({ queryKey: [...ADMIN_OAUTH_CLIENTS_QUERY_KEY, "list"] });
}

export function useCreateAdminOAuthClient() {
    const requestError = useAdminOAuthClientError();
    const resetLists = useAdminOAuthClientListReset();
    return useMutation({
        // The create response contains a plaintext secret and must not persist in mutation cache.
        gcTime: 0,
        mutationFn: async (input: AdminOAuthClientMetadataInput) => {
            const response = await adminCreateOAuthClient({
                body: buildAdminOAuthClientCreateData(input),
                cache: "no-store",
            });
            if (response.error || !response.data) {
                throw requestError(response.response?.status, "create");
            }
            return mapToCreatedAdminOAuthClient(response.data);
        },
        onSuccess: () => {
            void resetLists();
        },
    });
}

export type UpdateAdminOAuthClientInput = {
    readonly clientId: string;
    readonly patch: Partial<AdminOAuthClientMetadataInput>;
};

export function useUpdateAdminOAuthClient() {
    const requestError = useAdminOAuthClientError();
    const queryClient = useQueryClient();
    const resetLists = useAdminOAuthClientListReset();
    return useMutation({
        gcTime: 0,
        mutationFn: async ({ clientId, patch }: UpdateAdminOAuthClientInput) => {
            const response = await adminPatchOAuthClient({
                path: { clientId },
                body: buildAdminOAuthClientPatchData(patch),
                cache: "no-store",
            });
            if (response.error || !response.data) {
                throw requestError(response.response?.status, "update");
            }
            return mapToAdminOAuthClient(response.data);
        },
        onSuccess: async (client: AdminOAuthClient) => {
            queryClient.setQueryData(adminOAuthClientDetailQueryKey(client.clientId), client);
            await resetLists();
        },
        onError: async (error, { clientId }) => {
            if (
                error instanceof AdminOAuthClientRequestError &&
                (error.status === 404 || error.status === 409)
            ) {
                await Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: adminOAuthClientDetailQueryKey(clientId),
                    }),
                    resetLists(),
                ]);
            }
        },
    });
}

export function useDeleteAdminOAuthClient() {
    const requestError = useAdminOAuthClientError();
    const queryClient = useQueryClient();
    const resetLists = useAdminOAuthClientListReset();
    return useMutation({
        gcTime: 0,
        mutationFn: async (clientId: string) => {
            const response = await adminDeleteOAuthClient({
                path: { clientId },
                cache: "no-store",
            });
            if (response.error) {
                throw requestError(response.response?.status, "delete");
            }
            return clientId;
        },
        onSuccess: async (clientId) => {
            queryClient.removeQueries({ queryKey: adminOAuthClientDetailQueryKey(clientId) });
            await resetLists();
        },
        onError: async (error, clientId) => {
            if (
                error instanceof AdminOAuthClientRequestError &&
                (error.status === 404 || error.status === 409)
            ) {
                await Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: adminOAuthClientDetailQueryKey(clientId),
                    }),
                    resetLists(),
                ]);
            }
        },
    });
}
