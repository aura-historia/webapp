import {
    infiniteQueryOptions,
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import {
    adminCreateParty,
    adminDeleteParty,
    adminGetParty,
    adminSearchParties,
    adminUpdateParty,
} from "@/client";
import {
    ADMIN_PARTY_PAGE_SIZE,
    type AdminPartyFilters,
    type AdminPartyPage,
    type PartyFormValues,
    buildCreatePartyData,
    mapToAdminPartyPage,
    mapToAdminPartySearchQuery,
    mapToParty,
} from "@/data/internal/party/Party.ts";
import { ADMIN_OVERVIEW_QUERY_KEY } from "@/features/admin/overview/api/useAdminOverview.ts";

export const ADMIN_PARTIES_QUERY_KEY = ["admin", "parties"] as const;
export const adminPartyListQueryKey = (filters: AdminPartyFilters) =>
    [...ADMIN_PARTIES_QUERY_KEY, "list", filters] as const;
export const adminPartyDetailQueryKey = (id?: string) =>
    [...ADMIN_PARTIES_QUERY_KEY, "detail", id] as const;

type PartyRequestOperation = "read" | "create" | "update" | "delete";

export class AdminPartyRequestError extends Error {
    constructor(
        message: string,
        readonly status: number,
    ) {
        super(message);
    }
}

type AdminPartyErrorFactory = (
    status: number | undefined,
    operation: PartyRequestOperation,
) => AdminPartyRequestError;

export function createAdminPartyErrorFactory(t: TFunction): AdminPartyErrorFactory {
    return (status, operation) => {
        const safeStatus = status ?? 500;
        let key: string;
        if (safeStatus === 401 || safeStatus === 403) {
            key = "adminParties.errors.forbidden";
        } else if (safeStatus === 404) {
            key = "adminParties.errors.missing";
        } else if (safeStatus === 409 && operation === "delete") {
            key = "adminParties.errors.deleteConflict";
        } else if (safeStatus === 409 && operation === "create") {
            key = "adminParties.errors.createConflict";
        } else if (safeStatus === 409) {
            key = "adminParties.errors.updateConflict";
        } else if (safeStatus === 400) {
            key = "adminParties.errors.invalid";
        } else {
            key = "adminParties.errors.requestFailed";
        }
        // API problem details can echo submitted contact values; show only fixed localized copy.
        return new AdminPartyRequestError(t(key), safeStatus);
    };
}

function useAdminPartyError() {
    const { t } = useTranslation();
    return createAdminPartyErrorFactory(t);
}

function invalidatePartyLists(queryClient: ReturnType<typeof useQueryClient>) {
    void queryClient.invalidateQueries({ queryKey: [...ADMIN_PARTIES_QUERY_KEY, "list"] });
}

export function adminPartyListQueryOptions(
    filters: AdminPartyFilters,
    requestError: AdminPartyErrorFactory,
) {
    return infiniteQueryOptions({
        queryKey: adminPartyListQueryKey(filters),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (page: AdminPartyPage) => page.searchAfter,
        staleTime: 30_000,
        queryFn: async ({ pageParam, signal }) => {
            const response = await adminSearchParties({
                query: mapToAdminPartySearchQuery(filters, pageParam, ADMIN_PARTY_PAGE_SIZE),
                signal,
            });
            if (response.error || !response.data)
                throw requestError(response.response?.status, "read");
            return mapToAdminPartyPage(response.data);
        },
    });
}

export function useAdminParties(filters: AdminPartyFilters, enabled = true) {
    const requestError = useAdminPartyError();
    return useInfiniteQuery({ ...adminPartyListQueryOptions(filters, requestError), enabled });
}

export function useAdminParty(id?: string, enabled = true) {
    const requestError = useAdminPartyError();
    return useQuery({
        queryKey: adminPartyDetailQueryKey(id),
        enabled: enabled && Boolean(id),
        staleTime: 30_000,
        queryFn: async ({ signal }) => {
            if (!id) throw new Error("Missing party ID");
            const response = await adminGetParty({ path: { partyId: id }, signal });
            if (response.error || !response.data)
                throw requestError(response.response?.status, "read");
            return mapToParty(response.data);
        },
    });
}

export function useCreateAdminParty() {
    const queryClient = useQueryClient();
    const requestError = useAdminPartyError();
    return useMutation({
        mutationFn: async (values: PartyFormValues) => {
            const body = buildCreatePartyData(values);
            const response = await adminCreateParty({ body });
            if (response.error || !response.data)
                throw requestError(response.response?.status, "create");
            return response.data.partyId;
        },
        onSuccess: () => {
            invalidatePartyLists(queryClient);
            void queryClient.invalidateQueries({ queryKey: ADMIN_OVERVIEW_QUERY_KEY });
        },
        onError: (error) => {
            if (error instanceof AdminPartyRequestError && error.status === 409)
                invalidatePartyLists(queryClient);
        },
    });
}

export type UpdateAdminPartyInput = {
    readonly partyId: string;
    readonly patch: {
        readonly name?: string;
        readonly phone?: string | null;
        readonly email?: string | null;
    };
};

export function useUpdateAdminParty() {
    const queryClient = useQueryClient();
    const requestError = useAdminPartyError();
    return useMutation({
        mutationFn: async ({ partyId, patch }: UpdateAdminPartyInput) => {
            const response = await adminUpdateParty({ path: { partyId }, body: patch });
            if (response.error || !response.data)
                throw requestError(response.response?.status, "update");
            return response.data.partyId;
        },
        onSuccess: (partyId) => {
            void queryClient.invalidateQueries({ queryKey: adminPartyDetailQueryKey(partyId) });
            invalidatePartyLists(queryClient);
        },
        onError: (error, { partyId }) => {
            if (error instanceof AdminPartyRequestError && error.status === 409) {
                void queryClient.invalidateQueries({ queryKey: adminPartyDetailQueryKey(partyId) });
                invalidatePartyLists(queryClient);
            }
        },
    });
}

export function useDeleteAdminParty() {
    const queryClient = useQueryClient();
    const requestError = useAdminPartyError();
    return useMutation({
        mutationFn: async (partyId: string): Promise<string> => {
            const response = await adminDeleteParty({ path: { partyId } });
            if (response.error) throw requestError(response.response?.status, "delete");
            return partyId;
        },
        onSuccess: (partyId) => {
            queryClient.removeQueries({ queryKey: adminPartyDetailQueryKey(partyId) });
            invalidatePartyLists(queryClient);
            void queryClient.invalidateQueries({ queryKey: ADMIN_OVERVIEW_QUERY_KEY });
        },
        onError: (error, partyId) => {
            if (error instanceof AdminPartyRequestError && error.status === 409) {
                void queryClient.invalidateQueries({ queryKey: adminPartyDetailQueryKey(partyId) });
                invalidatePartyLists(queryClient);
            }
        },
    });
}
