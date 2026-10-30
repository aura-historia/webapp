import {
    infiniteQueryOptions,
    type QueryClient,
    queryOptions,
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import {
    getAdminProductListing,
    restoreAdminProductListing,
    searchAdminProductListings,
    updateAdminProductListing,
    withdrawAdminProductListing,
} from "@/client";
import {
    type AdminProductListingPage,
    type AdminProductListingPatch,
    mapAdminProductListingDetail,
    mapAdminProductListingMutation,
    mapAdminProductListingPage,
    mapToBackendAdminProductListingPatch,
} from "@/data/internal/product/AdminProductListing.ts";
import { ADMIN_OVERVIEW_QUERY_KEY } from "@/features/admin/overview/api/useAdminOverview.ts";
import {
    type AdminProductListingFilters,
    mapToAdminProductListingSearchQuery,
} from "../lib/adminProductListingSearch.ts";

export const ADMIN_PRODUCT_LISTINGS_QUERY_KEY = ["admin", "product-listings"] as const;
export const adminProductListingDetailQueryKey = (productListingId: string) =>
    [...ADMIN_PRODUCT_LISTINGS_QUERY_KEY, "detail", productListingId] as const;
export const ADMIN_PRODUCT_LISTING_LIST_QUERY_KEY = [
    ...ADMIN_PRODUCT_LISTINGS_QUERY_KEY,
    "list",
] as const;
/** Every filter, the sort and the page size are part of the key, so a scope change never reuses a cursor. */
export const adminProductListingListQueryKey = (filters: AdminProductListingFilters) =>
    [...ADMIN_PRODUCT_LISTING_LIST_QUERY_KEY, filters] as const;

export type AdminProductListingOperation = "search" | "read" | "update" | "withdraw" | "restore";

export type AdminProductListingErrorReason =
    | "forbidden"
    | "missing"
    | "invalidId"
    | "invalidSearch"
    | "invalid"
    | "invalidTitle"
    | "auctionMissing"
    | "auctionSourceMismatch"
    | "versionConflict"
    | "withdrawn"
    | "unavailable"
    | "indefinite"
    | "requestFailed";

/** Outcomes after which the loaded listing may be outdated; refetch before another command. */
const RECONCILIATION_REASONS = new Set<AdminProductListingErrorReason>([
    "versionConflict",
    "withdrawn",
    "indefinite",
    "missing",
]);

export class AdminProductListingRequestError extends Error {
    constructor(
        message: string,
        /** Absent when no response arrived. */
        readonly status: number | undefined,
        readonly operation: AdminProductListingOperation,
        readonly reason: AdminProductListingErrorReason,
    ) {
        super(message);
        this.name = "AdminProductListingRequestError";
    }

    get requiresReconciliation() {
        return RECONCILIATION_REASONS.has(this.reason);
    }
}

function isIndefiniteStatus(status: number | undefined) {
    return status === undefined || status === 408 || status === 429 || status >= 500;
}

/** Reads only the stable error code; problem details are never shown. */
function errorCode(error: unknown): string | undefined {
    if (typeof error !== "object" || error === null || !("error" in error)) return undefined;
    return typeof error.error === "string" ? error.error : undefined;
}

/** Reads only the stable problem field name; the rejected value is never shown. */
function errorField(error: unknown): string | undefined {
    if (typeof error !== "object" || error === null || !("source" in error)) return undefined;
    const source = error.source;
    if (typeof source !== "object" || source === null || !("field" in source)) return undefined;
    return typeof source.field === "string" ? source.field : undefined;
}

export function adminProductListingErrorReason(
    status: number | undefined,
    operation: AdminProductListingOperation,
    code?: string,
    field?: string,
): AdminProductListingErrorReason {
    if (status === 401 || status === 403) return "forbidden";
    if (status === 404) {
        return operation === "update" && code === "AUCTION_NOT_FOUND"
            ? "auctionMissing"
            : "missing";
    }
    if (status === 409) {
        if (code === "PRODUCT_LISTING_WITHDRAWN") return "withdrawn";
        if (operation === "update" && code === "CONFLICT") return "auctionSourceMismatch";
        return "versionConflict";
    }
    if (status === 400) {
        if (operation === "read") return "invalidId";
        if (operation === "search") return "invalidSearch";
        // A title with no text left after normalization is the one rejection the form cannot predict.
        if (operation === "update" && (field === "title" || field?.startsWith("title."))) {
            return "invalidTitle";
        }
        return "invalid";
    }
    // Without a definite response a command may or may not have been committed.
    if (operation !== "search" && operation !== "read" && isIndefiniteStatus(status)) {
        return "indefinite";
    }
    if (status === 503) return "unavailable";
    return "requestFailed";
}

type AdminProductListingErrorFactory = (
    status: number | undefined,
    operation: AdminProductListingOperation,
    error?: unknown,
) => AdminProductListingRequestError;

export function createAdminProductListingErrorFactory(
    t: TFunction,
): AdminProductListingErrorFactory {
    return (status, operation, error) => {
        const reason = adminProductListingErrorReason(
            status,
            operation,
            errorCode(error),
            errorField(error),
        );
        // API bodies can echo submitted URLs and identifiers. Only expose localized status copy.
        return new AdminProductListingRequestError(
            t(`adminProductListings.errors.${reason}`),
            status,
            operation,
            reason,
        );
    };
}

function useAdminProductListingRequestError() {
    const { t } = useTranslation();
    return createAdminProductListingErrorFactory(t);
}

export function adminProductListingDetailQueryOptions(
    productListingId: string,
    requestError: AdminProductListingErrorFactory,
) {
    return queryOptions({
        queryKey: adminProductListingDetailQueryKey(productListingId),
        staleTime: 0,
        gcTime: 0,
        retry: false,
        queryFn: async ({ signal }) => {
            const response = await getAdminProductListing({
                path: { productListingId },
                signal,
                cache: "no-store",
            });
            if (response.error || !response.data) {
                throw requestError(response.response?.status, "read", response.error);
            }
            return mapAdminProductListingDetail(response.data);
        },
    });
}

export function useAdminProductListing(productListingId: string) {
    return useQuery(
        adminProductListingDetailQueryOptions(
            productListingId,
            useAdminProductListingRequestError(),
        ),
    );
}

export function adminProductListingListQueryOptions(
    filters: AdminProductListingFilters,
    requestError: AdminProductListingErrorFactory,
) {
    return infiniteQueryOptions({
        queryKey: adminProductListingListQueryKey(filters),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (page: AdminProductListingPage) => page.searchAfter,
        staleTime: 0,
        gcTime: 0,
        retry: false,
        queryFn: async ({ pageParam, signal }) => {
            const response = await searchAdminProductListings({
                query: mapToAdminProductListingSearchQuery(filters, pageParam),
                signal,
                cache: "no-store",
            });
            if (response.error || !response.data) {
                throw requestError(response.response?.status, "search", response.error);
            }
            return mapAdminProductListingPage(response.data);
        },
    });
}

export function useAdminProductListings(filters: AdminProductListingFilters) {
    return useInfiniteQuery(
        adminProductListingListQueryOptions(filters, useAdminProductListingRequestError()),
    );
}

/**
 * Refetches the authoritative listing (awaited, so a follow-up command starts from it) and
 * refreshes directory pages and the overview aggregates that count lifecycle and availability.
 */
async function refreshListing(queryClient: QueryClient, productListingId: string) {
    void queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCT_LISTING_LIST_QUERY_KEY });
    void queryClient.invalidateQueries({ queryKey: ADMIN_OVERVIEW_QUERY_KEY });
    await queryClient.invalidateQueries({
        queryKey: adminProductListingDetailQueryKey(productListingId),
        exact: true,
    });
}

async function refreshAfterFailure(
    queryClient: QueryClient,
    productListingId: string,
    error: unknown,
) {
    // Never retry a command here: the administrator reviews the refetched state first.
    if (error instanceof AdminProductListingRequestError && error.requiresReconciliation) {
        await refreshListing(queryClient, productListingId);
    }
}

export type AdminProductListingCommand = {
    /** The version the draft or action was loaded with, never a newer one. */
    readonly expectedVersion: number;
};

export function useUpdateAdminProductListing(productListingId: string) {
    const queryClient = useQueryClient();
    const requestError = useAdminProductListingRequestError();
    return useMutation({
        gcTime: 0,
        mutationFn: async ({
            patch,
            expectedVersion,
        }: AdminProductListingCommand & { readonly patch: AdminProductListingPatch }) => {
            const response = await updateAdminProductListing({
                path: { productListingId },
                body: mapToBackendAdminProductListingPatch(patch, expectedVersion),
                cache: "no-store",
            });
            if (response.error || !response.data) {
                throw requestError(response.response?.status, "update", response.error);
            }
            return mapAdminProductListingMutation(response.data);
        },
        onSuccess: () => refreshListing(queryClient, productListingId),
        onError: (error) => refreshAfterFailure(queryClient, productListingId, error),
    });
}

/** Withdrawal retains the listing and its history; the 204 response carries no version. */
export function useWithdrawAdminProductListing(productListingId: string) {
    const queryClient = useQueryClient();
    const requestError = useAdminProductListingRequestError();
    return useMutation({
        gcTime: 0,
        mutationFn: async ({ expectedVersion }: AdminProductListingCommand) => {
            const response = await withdrawAdminProductListing({
                path: { productListingId },
                query: { expectedVersion },
                cache: "no-store",
            });
            if (response.error) {
                throw requestError(response.response?.status, "withdraw", response.error);
            }
        },
        onSuccess: () => refreshListing(queryClient, productListingId),
        onError: (error) => refreshAfterFailure(queryClient, productListingId, error),
    });
}

/** Restoration returns the listing to active with unknown availability. */
export function useRestoreAdminProductListing(productListingId: string) {
    const queryClient = useQueryClient();
    const requestError = useAdminProductListingRequestError();
    return useMutation({
        gcTime: 0,
        mutationFn: async ({ expectedVersion }: AdminProductListingCommand) => {
            const response = await restoreAdminProductListing({
                path: { productListingId },
                body: { expectedVersion },
                cache: "no-store",
            });
            if (response.error || !response.data) {
                throw requestError(response.response?.status, "restore", response.error);
            }
            return mapAdminProductListingMutation(response.data);
        },
        onSuccess: () => refreshListing(queryClient, productListingId),
        onError: (error) => refreshAfterFailure(queryClient, productListingId, error),
    });
}
