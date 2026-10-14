import {
    type QueryClient,
    queryOptions,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import {
    adminAssignSourceLocationDefault,
    adminChangeSourceLocationDefaultApplicability,
    adminClearSourceLocationDefault,
    adminGetSourceLocationDefault,
    type SourceLocationDefaultData,
} from "@/client";
import { geographyQueryKeys } from "@/data/internal/geography/GeographyQueryKeys.ts";
import {
    isValidSourceLocationEvidenceReference,
    mapToBackendAssignSourceLocationDefault,
    mapToBackendChangeSourceLocationDefaultApplicability,
    mapToBackendClearSourceLocationDefault,
    mapToSourceLocationDefault,
    type SourceLocationDefault,
} from "@/data/internal/geography/SourceLocationDefault.ts";
import { adminListingSourceDetailQueryKey } from "./useAdminListingSources.ts";

/**
 * The source whose default is managed, with the operator Party that owns every selectable
 * location. The viewer key partitions the operator's cached Party locations.
 */
export type AdminSourceLocationDefaultScope = {
    readonly viewerCacheKey: string;
    readonly listingSourceId: string;
    readonly operatorPartyId: string;
};

type SourceLocationDefaultOperation = "read" | "assign" | "applicability" | "clear";

export type AdminSourceLocationDefaultErrorReason =
    | "forbidden"
    | "missing"
    | "locationUnavailable"
    | "conflict"
    | "invalid"
    | "unavailable"
    | "requestFailed";

export class AdminSourceLocationDefaultRequestError extends Error {
    constructor(
        message: string,
        /** Absent when no response arrived. */
        readonly status: number | undefined,
        readonly reason: AdminSourceLocationDefaultErrorReason,
    ) {
        super(message);
        this.name = "AdminSourceLocationDefaultRequestError";
    }

    /** Administrator authority is missing or was removed: hide loaded content. */
    get isAccessLoss() {
        return this.reason === "forbidden";
    }
}

/** Reads only the stable error code; problem details are never shown. */
function errorCode(error: unknown): string | undefined {
    if (typeof error !== "object" || error === null || !("error" in error)) return undefined;
    return typeof error.error === "string" ? error.error : undefined;
}

export function adminSourceLocationDefaultErrorReason(
    status: number | undefined,
    operation: SourceLocationDefaultOperation,
    code?: string,
): AdminSourceLocationDefaultErrorReason {
    if (status === 401 || status === 403) return "forbidden";
    // A read is rejected with 400 only for a malformed source ID.
    if (status === 404 || (status === 400 && operation === "read")) {
        // PARTY_NOT_FOUND: the chosen location does not exist or the operator does not own it.
        return code === "PARTY_NOT_FOUND" && operation !== "read"
            ? "locationUnavailable"
            : "missing";
    }
    // Stale revision, a retired selection, or applicability without an active assignment.
    if (status === 409) return "conflict";
    if (status === 400) return "invalid";
    if (status === 503) return "unavailable";
    return "requestFailed";
}

type SourceLocationDefaultErrorFactory = (
    status: number | undefined,
    operation: SourceLocationDefaultOperation,
    error?: unknown,
) => AdminSourceLocationDefaultRequestError;

export function createAdminSourceLocationDefaultErrorFactory(
    t: TFunction,
): SourceLocationDefaultErrorFactory {
    return (status, operation, error) => {
        const reason = adminSourceLocationDefaultErrorReason(status, operation, errorCode(error));
        // Problem details can echo evidence references; show only fixed localized copy.
        return new AdminSourceLocationDefaultRequestError(
            t(`adminListingSources.locationDefault.errors.${reason}`),
            status,
            reason,
        );
    };
}

function useAdminSourceLocationDefaultError() {
    const { t } = useTranslation();
    return createAdminSourceLocationDefaultErrorFactory(t);
}

function requireDefault(
    data: SourceLocationDefaultData | undefined,
    listingSourceId: string,
    requestError: SourceLocationDefaultErrorFactory,
    operation: SourceLocationDefaultOperation,
): SourceLocationDefault {
    if (!data || data.listingSourceId !== listingSourceId) throw requestError(500, operation);
    return mapToSourceLocationDefault(data);
}

export function adminSourceLocationDefaultQueryOptions(
    listingSourceId: string,
    requestError: SourceLocationDefaultErrorFactory,
) {
    return queryOptions({
        queryKey: geographyQueryKeys.adminSourceLocationDefault(listingSourceId),
        retry: false,
        queryFn: async ({ signal }) => {
            const response = await adminGetSourceLocationDefault({
                path: { listing_source_id: listingSourceId },
                signal,
                cache: "no-store",
            });
            if (response.error || !response.data) {
                throw requestError(response.response?.status, "read", response.error);
            }
            return requireDefault(response.data, listingSourceId, requestError, "read");
        },
    });
}

/** Read through the admin-specific route; operator membership or a source grant is not enough. */
export function useAdminSourceLocationDefault(listingSourceId: string | undefined, enabled = true) {
    const requestError = useAdminSourceLocationDefaultError();
    return useQuery({
        ...adminSourceLocationDefaultQueryOptions(listingSourceId ?? "", requestError),
        enabled: enabled && Boolean(listingSourceId),
    });
}

/**
 * Stores the returned state unless a refetch already loaded a newer revision. A viewer's own
 * (non-admin) read of the same source is refetched as well.
 */
function storeDefault(
    queryClient: QueryClient,
    scope: AdminSourceLocationDefaultScope,
    sourceDefault: SourceLocationDefault,
) {
    queryClient.setQueryData<SourceLocationDefault>(
        geographyQueryKeys.adminSourceLocationDefault(scope.listingSourceId),
        (cached) => (cached && cached.revision > sourceDefault.revision ? cached : sourceDefault),
    );
    void queryClient.invalidateQueries({
        queryKey: geographyQueryKeys.sourceLocationDefault(
            scope.viewerCacheKey,
            scope.listingSourceId,
        ),
    });
}

/**
 * Every failure refetches authoritative state without touching drafts: the source default (stale
 * revision), the operator's locations (an inactive or foreign site) and, for a missing source or
 * location, the source detail whose operator may have changed. Lost authority resets the default
 * so protected content is not shown again.
 */
function handleMutationError(
    queryClient: QueryClient,
    scope: AdminSourceLocationDefaultScope,
    error: Error,
) {
    const defaultKey = geographyQueryKeys.adminSourceLocationDefault(scope.listingSourceId);
    if (error instanceof AdminSourceLocationDefaultRequestError && error.isAccessLoss) {
        void queryClient.resetQueries({ queryKey: defaultKey });
        return;
    }
    if (error instanceof AdminSourceLocationDefaultRequestError && error.reason === "invalid") {
        return;
    }
    void queryClient.invalidateQueries({ queryKey: defaultKey });
    void queryClient.invalidateQueries({
        queryKey: geographyQueryKeys.partyLocationScope(
            scope.viewerCacheKey,
            scope.operatorPartyId,
        ),
    });
    if (
        error instanceof AdminSourceLocationDefaultRequestError &&
        (error.reason === "missing" || error.reason === "locationUnavailable")
    ) {
        void queryClient.invalidateQueries({
            queryKey: adminListingSourceDetailQueryKey(scope.listingSourceId),
        });
    }
}

export type AssignAdminSourceLocationDefaultInput = {
    readonly expectedRevision: number;
    readonly partyLocationId: string;
    readonly businessAssociation?: string;
    readonly advertisedInventory?: string;
};

function hasInvalidEvidence(...references: readonly (string | null | undefined)[]) {
    return references.some(
        (reference) =>
            typeof reference === "string" && !isValidSourceLocationEvidenceReference(reference),
    );
}

/** Assigns or replaces the location and both applicability assertions atomically. */
export function useAssignAdminSourceLocationDefault(scope: AdminSourceLocationDefaultScope) {
    const queryClient = useQueryClient();
    const requestError = useAdminSourceLocationDefaultError();
    return useMutation({
        mutationFn: async (input: AssignAdminSourceLocationDefaultInput) => {
            if (hasInvalidEvidence(input.businessAssociation, input.advertisedInventory)) {
                throw requestError(400, "assign");
            }
            const response = await adminAssignSourceLocationDefault({
                path: { listing_source_id: scope.listingSourceId },
                body: mapToBackendAssignSourceLocationDefault(input),
                cache: "no-store",
            });
            if (response.error || !response.data) {
                throw requestError(response.response?.status, "assign", response.error);
            }
            return requireDefault(response.data, scope.listingSourceId, requestError, "assign");
        },
        onSuccess: (sourceDefault) => storeDefault(queryClient, scope, sourceDefault),
        onError: (error) => handleMutationError(queryClient, scope, error),
    });
}

export type ChangeAdminSourceLocationDefaultApplicabilityInput = {
    readonly expectedRevision: number;
    /** Omitted retains the assertion; `null` removes it; text sets its evidence reference. */
    readonly businessAssociation?: string | null;
    readonly advertisedInventory?: string | null;
};

/** Changes applicability on the existing, active reference without changing its location. */
export function useChangeAdminSourceLocationDefaultApplicability(
    scope: AdminSourceLocationDefaultScope,
) {
    const queryClient = useQueryClient();
    const requestError = useAdminSourceLocationDefaultError();
    return useMutation({
        mutationFn: async (input: ChangeAdminSourceLocationDefaultApplicabilityInput) => {
            if (hasInvalidEvidence(input.businessAssociation, input.advertisedInventory)) {
                throw requestError(400, "applicability");
            }
            const response = await adminChangeSourceLocationDefaultApplicability({
                path: { listing_source_id: scope.listingSourceId },
                body: mapToBackendChangeSourceLocationDefaultApplicability(input),
                cache: "no-store",
            });
            if (response.error || !response.data) {
                throw requestError(response.response?.status, "applicability", response.error);
            }
            return requireDefault(
                response.data,
                scope.listingSourceId,
                requestError,
                "applicability",
            );
        },
        onSuccess: (sourceDefault) => storeDefault(queryClient, scope, sourceDefault),
        onError: (error) => handleMutationError(queryClient, scope, error),
    });
}

/** Clears the reference, including a retired one, at the revision the confirmation showed. */
export function useClearAdminSourceLocationDefault(scope: AdminSourceLocationDefaultScope) {
    const queryClient = useQueryClient();
    const requestError = useAdminSourceLocationDefaultError();
    return useMutation({
        mutationFn: async (expectedRevision: number) => {
            const response = await adminClearSourceLocationDefault({
                path: { listing_source_id: scope.listingSourceId },
                body: mapToBackendClearSourceLocationDefault(expectedRevision),
                cache: "no-store",
            });
            if (response.error || !response.data) {
                throw requestError(response.response?.status, "clear", response.error);
            }
            return requireDefault(response.data, scope.listingSourceId, requestError, "clear");
        },
        onSuccess: (sourceDefault) => storeDefault(queryClient, scope, sourceDefault),
        onError: (error) => handleMutationError(queryClient, scope, error),
    });
}
