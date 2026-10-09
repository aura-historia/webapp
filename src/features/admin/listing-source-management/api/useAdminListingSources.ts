import {
    infiniteQueryOptions,
    type QueryKey,
    queryOptions,
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import {
    adminCreateListingSource,
    adminDeleteListingSource,
    adminGetListingSource,
    adminSearchListingSources,
    adminUpdateListingSource,
} from "@/client";
import {
    ADMIN_LISTING_SOURCE_PAGE_SIZE,
    type AdminListingSourceDetail,
    type AdminListingSourceFilters,
    type AdminListingSourcePage,
    type AdminListingSourceCreateValues,
    type AdminListingSourceUpdateValues,
    buildCreateAdminListingSourceData,
    buildUpdateAdminListingSourceData,
    mapToAdminListingSourceDetail,
    mapToAdminListingSourcePage,
    mapToListingSourceReference,
    mapToAdminListingSourceSearchQuery,
} from "@/data/internal/listing-source/AdminListingSource.ts";
import { ADMIN_OVERVIEW_QUERY_KEY } from "@/features/admin/overview/api/useAdminOverview.ts";

export const ADMIN_LISTING_SOURCES_QUERY_KEY = ["admin", "listing-sources"] as const;
export const adminListingSourceListQueryKey = (filters: AdminListingSourceFilters) =>
    [...ADMIN_LISTING_SOURCES_QUERY_KEY, "list", filters] as const;
export const adminListingSourceDetailQueryKey = (id?: string) =>
    [...ADMIN_LISTING_SOURCES_QUERY_KEY, "detail", id] as const;

type ListingSourceOperation = "read" | "create" | "update" | "delete";

export class AdminListingSourceRequestError extends Error {
    constructor(
        message: string,
        readonly status: number,
    ) {
        super(message);
    }
}

type ListingSourceErrorFactory = (
    status: number | undefined,
    operation: ListingSourceOperation,
) => AdminListingSourceRequestError;

export function createAdminListingSourceErrorFactory(t: TFunction): ListingSourceErrorFactory {
    return (status, operation) => {
        const safeStatus = status ?? 500;
        let key: string;
        if (safeStatus === 401 || safeStatus === 403) {
            key = "adminListingSources.errors.forbidden";
        } else if (safeStatus === 404) {
            key = "adminListingSources.errors.missing";
        } else if (safeStatus === 409 && operation === "delete") {
            key = "adminListingSources.errors.deleteConflict";
        } else if (safeStatus === 409 && operation === "create") {
            key = "adminListingSources.errors.createConflict";
        } else if (safeStatus === 409) {
            key = "adminListingSources.errors.updateConflict";
        } else if (safeStatus === 400) {
            key = "adminListingSources.errors.invalid";
        } else {
            key = "adminListingSources.errors.requestFailed";
        }
        // API error bodies may echo submitted configuration values. Never show them in admin UI.
        return new AdminListingSourceRequestError(t(key), safeStatus);
    };
}

function useAdminListingSourceError() {
    const { t } = useTranslation();
    return createAdminListingSourceErrorFactory(t);
}

export function adminListingSourceListQueryOptions(
    filters: AdminListingSourceFilters,
    requestError: ListingSourceErrorFactory,
) {
    return infiniteQueryOptions({
        queryKey: adminListingSourceListQueryKey(filters),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (page: AdminListingSourcePage) => page.searchAfter,
        staleTime: 30_000,
        queryFn: async ({ pageParam, signal }) => {
            const response = await adminSearchListingSources({
                query: mapToAdminListingSourceSearchQuery(
                    filters,
                    pageParam,
                    ADMIN_LISTING_SOURCE_PAGE_SIZE,
                ),
                signal,
            });
            if (response.error || !response.data)
                throw requestError(response.response?.status, "read");
            return mapToAdminListingSourcePage(response.data);
        },
    });
}

export function adminListingSourceDetailQueryOptions(
    id: string,
    requestError: ListingSourceErrorFactory,
) {
    return queryOptions({
        queryKey: adminListingSourceDetailQueryKey(id),
        staleTime: 30_000,
        queryFn: async ({ signal }) => {
            const response = await adminGetListingSource({ path: { listingSourceId: id }, signal });
            if (response.error || !response.data)
                throw requestError(response.response?.status, "read");
            return mapToAdminListingSourceDetail(response.data);
        },
    });
}

export function useAdminListingSources(filters: AdminListingSourceFilters) {
    const requestError = useAdminListingSourceError();
    return useInfiniteQuery(adminListingSourceListQueryOptions(filters, requestError));
}

export function useAdminListingSource(id: string | undefined, enabled = true) {
    const requestError = useAdminListingSourceError();
    return useQuery({
        ...adminListingSourceDetailQueryOptions(id ?? "", requestError),
        enabled: enabled && Boolean(id),
    });
}

const PUBLIC_LISTING_SOURCE_QUERY_PREFIXES = new Set([
    "publicListingSourceSearch",
    "public-listing-source-selection",
]);
const PUBLIC_LISTING_SOURCE_QUERY_IDS = new Set([
    "searchPublicListingSources",
    "getPublicListingSourceBySlug",
]);

export function isPublicListingSourceQuery(queryKey: QueryKey): boolean {
    const [head] = queryKey;
    if (typeof head === "string") return PUBLIC_LISTING_SOURCE_QUERY_PREFIXES.has(head);
    return (
        typeof head === "object" &&
        head !== null &&
        "_id" in head &&
        PUBLIC_LISTING_SOURCE_QUERY_IDS.has(String((head as { _id?: unknown })._id))
    );
}

function invalidateListingSourceRelatedData(
    queryClient: ReturnType<typeof useQueryClient>,
    id?: string,
) {
    if (id) void queryClient.invalidateQueries({ queryKey: adminListingSourceDetailQueryKey(id) });
    void queryClient.invalidateQueries({
        queryKey: [...ADMIN_LISTING_SOURCES_QUERY_KEY, "list"],
    });
    for (const queryKey of [
        ["admin", "partnership-applications"],
        ["admin", "partnerships"],
        ADMIN_OVERVIEW_QUERY_KEY,
    ] as const) {
        void queryClient.invalidateQueries({ queryKey });
    }
    // Public search, merchant selection, and shop profiles cache source names and slugs.
    void queryClient.invalidateQueries({
        predicate: ({ queryKey }) => isPublicListingSourceQuery(queryKey),
    });
}

export function useCreateAdminListingSource() {
    const queryClient = useQueryClient();
    const requestError = useAdminListingSourceError();
    return useMutation({
        // The create variables can contain a one-time WooCommerce secret.
        gcTime: 0,
        mutationFn: async (values: AdminListingSourceCreateValues) => {
            const response = await adminCreateListingSource({
                body: buildCreateAdminListingSourceData(values),
            });
            if (response.error || !response.data)
                throw requestError(response.response?.status, "create");
            return mapToListingSourceReference(response.data);
        },
        onSuccess: (reference) =>
            invalidateListingSourceRelatedData(queryClient, reference.listingSourceId),
        onError: (error) => {
            if (error instanceof AdminListingSourceRequestError && error.status === 409) {
                invalidateListingSourceRelatedData(queryClient);
            }
        },
    });
}

export type UpdateAdminListingSourceInput = {
    readonly source: AdminListingSourceDetail;
    readonly values: AdminListingSourceUpdateValues;
};

export function useUpdateAdminListingSource() {
    const queryClient = useQueryClient();
    const requestError = useAdminListingSourceError();
    return useMutation({
        // The update variables can contain a one-time WooCommerce secret.
        gcTime: 0,
        mutationFn: async ({ source, values }: UpdateAdminListingSourceInput) => {
            const response = await adminUpdateListingSource({
                path: { listingSourceId: source.listingSourceId },
                body: buildUpdateAdminListingSourceData(source, values),
            });
            if (response.error || !response.data)
                throw requestError(response.response?.status, "update");
            return mapToListingSourceReference(response.data);
        },
        onSuccess: (reference) =>
            invalidateListingSourceRelatedData(queryClient, reference.listingSourceId),
        onError: (error, { source }) => {
            if (error instanceof AdminListingSourceRequestError && error.status === 409) {
                invalidateListingSourceRelatedData(queryClient, source.listingSourceId);
            }
        },
    });
}

export function useDeleteAdminListingSource() {
    const queryClient = useQueryClient();
    const requestError = useAdminListingSourceError();
    return useMutation({
        mutationFn: async (listingSourceId: string): Promise<string> => {
            const response = await adminDeleteListingSource({ path: { listingSourceId } });
            if (response.error) throw requestError(response.response?.status, "delete");
            return listingSourceId;
        },
        onSuccess: (listingSourceId) => {
            queryClient.removeQueries({
                queryKey: adminListingSourceDetailQueryKey(listingSourceId),
            });
            invalidateListingSourceRelatedData(queryClient, listingSourceId);
        },
        onError: (error, listingSourceId) => {
            if (error instanceof AdminListingSourceRequestError && error.status === 409) {
                invalidateListingSourceRelatedData(queryClient, listingSourceId);
            }
        },
    });
}
