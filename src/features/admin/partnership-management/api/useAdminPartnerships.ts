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
    adminDissolvePartnership,
    adminGetPartnership,
    adminGrantPartnershipListingSource,
    adminGrantPartnershipMembership,
    adminRevokePartnershipListingSource,
    adminRevokePartnershipMembership,
    adminSearchPartnerships,
} from "@/client";
import {
    type AdminPartnershipCursor,
    type AdminPartnershipFilters,
    type AdminPartnershipPage,
    mapToAdminPartnershipDetails,
    mapToAdminPartnershipPage,
    mapToAdminPartnershipSearchQuery,
} from "@/data/internal/partnership/AdminPartnership.ts";
import { OWN_LISTING_SOURCES_QUERY_KEY } from "@/features/partner/common/api/useOwnListingSources.ts";

export const ADMIN_PARTNERSHIPS_QUERY_KEY = ["admin", "partnerships"] as const;
export const adminPartnershipListQueryKey = (filters: AdminPartnershipFilters) =>
    [...ADMIN_PARTNERSHIPS_QUERY_KEY, "list", filters] as const;
export const adminPartnershipDetailQueryKey = (partnershipId?: string) =>
    [...ADMIN_PARTNERSHIPS_QUERY_KEY, "detail", partnershipId] as const;

type PartnershipOperation =
    | "read"
    | "grantMember"
    | "revokeMember"
    | "grantSource"
    | "revokeSource"
    | "dissolve";

export class AdminPartnershipRequestError extends Error {
    constructor(
        message: string,
        readonly status: number,
    ) {
        super(message);
    }
}

type PartnershipErrorFactory = (
    status: number | undefined,
    operation: PartnershipOperation,
) => AdminPartnershipRequestError;

export function createAdminPartnershipErrorFactory(t: TFunction): PartnershipErrorFactory {
    return (status, operation) => {
        const safeStatus = status ?? 500;
        let key: string;
        if (safeStatus === 401 || safeStatus === 403) {
            key = "adminPartnerships.errors.forbidden";
        } else if (safeStatus === 400) {
            key = "adminPartnerships.errors.invalid";
        } else if (safeStatus === 404 && (operation === "read" || operation === "dissolve")) {
            key = "adminPartnerships.errors.missing";
        } else if (safeStatus === 404) {
            key = "adminPartnerships.errors.referenceMissing";
        } else if (safeStatus === 409 && operation === "grantSource") {
            key = "adminPartnerships.errors.partyConflict";
        } else if (safeStatus === 409 && operation === "dissolve") {
            key = "adminPartnerships.errors.dissolveConflict";
        } else if (safeStatus === 409) {
            key = "adminPartnerships.errors.conflict";
        } else if (safeStatus === 500 && operation === "dissolve") {
            key = "adminPartnerships.errors.dissolveFailed";
        } else {
            key = "adminPartnerships.errors.requestFailed";
        }

        // Do not display backend error details: admin responses may include submitted identifiers.
        return new AdminPartnershipRequestError(t(key), safeStatus);
    };
}

function useAdminPartnershipError() {
    const { t } = useTranslation();
    return createAdminPartnershipErrorFactory(t);
}

export function adminPartnershipListQueryOptions(
    filters: AdminPartnershipFilters,
    requestError: PartnershipErrorFactory,
) {
    return infiniteQueryOptions({
        queryKey: adminPartnershipListQueryKey(filters),
        initialPageParam: undefined as AdminPartnershipCursor | undefined,
        getNextPageParam: (page: AdminPartnershipPage) => page.searchAfter,
        staleTime: 30_000,
        queryFn: async ({ pageParam, signal }) => {
            const response = await adminSearchPartnerships({
                query: mapToAdminPartnershipSearchQuery(filters, pageParam),
                signal,
            });
            if (response.error || !response.data) {
                throw requestError(response.response?.status, "read");
            }
            return mapToAdminPartnershipPage(response.data);
        },
    });
}

export function adminPartnershipDetailQueryOptions(
    partnershipId: string,
    requestError: PartnershipErrorFactory,
) {
    return queryOptions({
        queryKey: adminPartnershipDetailQueryKey(partnershipId),
        staleTime: 30_000,
        queryFn: async ({ signal }) => {
            const response = await adminGetPartnership({
                path: { partnershipId },
                signal,
            });
            if (response.error || !response.data) {
                throw requestError(response.response?.status, "read");
            }
            return mapToAdminPartnershipDetails(response.data);
        },
    });
}

export function useAdminPartnerships(filters: AdminPartnershipFilters) {
    const requestError = useAdminPartnershipError();
    return useInfiniteQuery(adminPartnershipListQueryOptions(filters, requestError));
}

export function useAdminPartnership(partnershipId?: string, enabled = true) {
    const requestError = useAdminPartnershipError();
    return useQuery({
        ...adminPartnershipDetailQueryOptions(partnershipId ?? "", requestError),
        enabled: enabled && Boolean(partnershipId),
    });
}

type PartnershipMutationInput = { readonly partnershipId: string };
type MembershipInput = PartnershipMutationInput & { readonly userId: string };
type ListingSourceGrantInput = PartnershipMutationInput & { readonly listingSourceId: string };

async function invalidatePartnershipState(
    queryClient: ReturnType<typeof useQueryClient>,
    partnershipId: string,
    removeDetail = false,
) {
    // Fail closed while the server refreshes the viewer's source access and its available choices.
    await queryClient.cancelQueries({ queryKey: OWN_LISTING_SOURCES_QUERY_KEY });
    queryClient.setQueryData(OWN_LISTING_SOURCES_QUERY_KEY, []);

    if (removeDetail) {
        queryClient.removeQueries({ queryKey: adminPartnershipDetailQueryKey(partnershipId) });
    }

    await Promise.all([
        queryClient.invalidateQueries({ queryKey: ADMIN_PARTNERSHIPS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ["admin", "overview"] }),
        queryClient.invalidateQueries({ queryKey: OWN_LISTING_SOURCES_QUERY_KEY }),
    ]);
}

export function useGrantAdminPartnershipMembership() {
    const requestError = useAdminPartnershipError();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ partnershipId, userId }: MembershipInput) => {
            const response = await adminGrantPartnershipMembership({
                path: { partnershipId, userId },
            });
            // These endpoints return 204 and intentionally have no JSON body.
            if (response.error) {
                throw requestError(response.response?.status, "grantMember");
            }
        },
        onSuccess: (_result, { partnershipId }) =>
            invalidatePartnershipState(queryClient, partnershipId),
        onError: (_error, { partnershipId }) =>
            invalidatePartnershipState(queryClient, partnershipId),
    });
}

export function useRevokeAdminPartnershipMembership() {
    const requestError = useAdminPartnershipError();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ partnershipId, userId }: MembershipInput) => {
            const response = await adminRevokePartnershipMembership({
                path: { partnershipId, userId },
            });
            if (response.error) {
                throw requestError(response.response?.status, "revokeMember");
            }
        },
        onSuccess: (_result, { partnershipId }) =>
            invalidatePartnershipState(queryClient, partnershipId),
        onError: (_error, { partnershipId }) =>
            invalidatePartnershipState(queryClient, partnershipId),
    });
}

export function useGrantAdminPartnershipListingSource() {
    const requestError = useAdminPartnershipError();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ partnershipId, listingSourceId }: ListingSourceGrantInput) => {
            const response = await adminGrantPartnershipListingSource({
                path: { partnershipId, listingSourceId },
            });
            if (response.error) {
                throw requestError(response.response?.status, "grantSource");
            }
        },
        onSuccess: (_result, { partnershipId }) =>
            invalidatePartnershipState(queryClient, partnershipId),
        onError: (_error, { partnershipId }) =>
            invalidatePartnershipState(queryClient, partnershipId),
    });
}

export function useRevokeAdminPartnershipListingSource() {
    const requestError = useAdminPartnershipError();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ partnershipId, listingSourceId }: ListingSourceGrantInput) => {
            const response = await adminRevokePartnershipListingSource({
                path: { partnershipId, listingSourceId },
            });
            if (response.error) {
                throw requestError(response.response?.status, "revokeSource");
            }
        },
        onSuccess: (_result, { partnershipId }) =>
            invalidatePartnershipState(queryClient, partnershipId),
        onError: (_error, { partnershipId }) =>
            invalidatePartnershipState(queryClient, partnershipId),
    });
}

export function useDissolveAdminPartnership() {
    const requestError = useAdminPartnershipError();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ partnershipId }: PartnershipMutationInput) => {
            const response = await adminDissolvePartnership({ path: { partnershipId } });
            if (response.error) {
                throw requestError(response.response?.status, "dissolve");
            }
        },
        onSuccess: (_result, { partnershipId }) =>
            invalidatePartnershipState(queryClient, partnershipId, true),
        onError: (_error, { partnershipId }) =>
            invalidatePartnershipState(queryClient, partnershipId),
    });
}
