import {
    type InfiniteData,
    infiniteQueryOptions,
    type QueryClient,
    useInfiniteQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import type { TFunction } from "i18next";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import {
    correctPartyLocation,
    createPartyLocation,
    listPartyLocations,
    setPartyLocationLifecycle,
} from "@/client";
import { createIdempotencyKey } from "@/data/internal/common/IdempotencyKey.ts";
import { geographyQueryKeys } from "@/data/internal/geography/GeographyQueryKeys.ts";
import {
    type CorrectPartyLocationInput,
    type CreatePartyLocationInput,
    mapToBackendCorrectPartyLocation,
    mapToBackendCreatePartyLocation,
    mapToBackendSetPartyLocationLifecycle,
    mapToPartyLocation,
    mapToPartyLocationPage,
    type PartyLocation,
    type PartyLocationLifecycle,
    type PartyLocationPage,
    validatePartyLocationInput,
} from "@/data/internal/geography/PartyLocation.ts";

export const PARTY_LOCATION_PAGE_SIZE = 25;

/**
 * The viewer and Party whose locations are managed. The same protected operations serve
 * administrators and authorized Party managers; the backend decides authority per request.
 */
export type PartyLocationScope = {
    /** Stable, non-secret cache partition for the signed-in viewer. */
    readonly viewerCacheKey: string;
    readonly partyId: string;
};

type PartyLocationOperation = "read" | "create" | "relocate" | "correct" | "lifecycle";

export class PartyLocationRequestError extends Error {
    constructor(
        message: string,
        /** Absent when no response arrived. */
        readonly status: number | undefined,
    ) {
        super(message);
    }

    /** Stale revision, retired-location write or conflicting retry: refetch, never retry blindly. */
    get isConflict() {
        return this.status === 409;
    }

    /** Authorization was missing or removed, or the Party or location is no longer available. */
    get isAccessLoss() {
        return this.status === 401 || this.status === 403 || this.status === 404;
    }

    /** No definite outcome: an unchanged create may be retried with the same key. */
    get isIndefinite() {
        return isIndefiniteStatus(this.status);
    }
}

function isIndefiniteStatus(status: number | undefined) {
    return status === undefined || status === 408 || status === 429 || status >= 500;
}

type PartyLocationErrorFactory = (
    status: number | undefined,
    operation: PartyLocationOperation,
) => PartyLocationRequestError;

function errorKey(status: number | undefined, operation: PartyLocationOperation): string {
    if (status === 401 || status === 403) return "partyLocations.errors.forbidden";
    // A read is rejected with 400 only for a malformed Party or location ID, not edited details.
    if (status === 404 || (status === 400 && operation === "read")) {
        return "partyLocations.errors.missing";
    }
    if (status === 400) return "partyLocations.errors.invalid";
    if (status === 409) {
        return operation === "create"
            ? "partyLocations.errors.createConflict"
            : "partyLocations.errors.conflict";
    }
    if (status === 503) return "partyLocations.errors.unavailable";
    if ((operation === "create" || operation === "relocate") && isIndefiniteStatus(status)) {
        return "partyLocations.errors.createIndefinite";
    }
    return "partyLocations.errors.requestFailed";
}

export function createPartyLocationErrorFactory(t: TFunction): PartyLocationErrorFactory {
    // Problem details can echo submitted addresses or evidence; show only fixed localized copy.
    return (status, operation) =>
        new PartyLocationRequestError(t(errorKey(status, operation)), status);
}

function usePartyLocationError() {
    const { t } = useTranslation();
    return createPartyLocationErrorFactory(t);
}

function requireLocation(
    data: Parameters<typeof mapToPartyLocation>[0] | undefined,
    scope: PartyLocationScope,
    requestError: PartyLocationErrorFactory,
    operation: PartyLocationOperation,
): PartyLocation {
    if (!data || data.partyId !== scope.partyId) throw requestError(500, operation);
    return mapToPartyLocation(data);
}

/**
 * Replaces a saved location in the loaded pages at once (never with an older revision than a
 * refetch already loaded), then refetches the authoritative list, which also adds new locations.
 */
function storeLocation(
    queryClient: QueryClient,
    scope: PartyLocationScope,
    location: PartyLocation,
) {
    const queryKey = geographyQueryKeys.partyLocationList(scope.viewerCacheKey, scope.partyId);
    queryClient.setQueryData<InfiniteData<PartyLocationPage, string | undefined>>(
        queryKey,
        (data) =>
            data && {
                ...data,
                pages: data.pages.map((page) => ({
                    ...page,
                    items: page.items.map((item) =>
                        item.id === location.id && item.revision <= location.revision
                            ? location
                            : item,
                    ),
                })),
            },
    );
    void queryClient.invalidateQueries({ queryKey });
}

/**
 * A conflict refetches the authoritative locations without touching drafts. Lost authority or a
 * missing Party resets every cached read of this Party so protected content is not shown again.
 */
function handleMutationError(queryClient: QueryClient, scope: PartyLocationScope, error: Error) {
    if (!(error instanceof PartyLocationRequestError)) return;
    const queryKey = geographyQueryKeys.partyLocationScope(scope.viewerCacheKey, scope.partyId);
    if (error.isAccessLoss) void queryClient.resetQueries({ queryKey });
    else if (error.isConflict) void queryClient.invalidateQueries({ queryKey });
}

export function partyLocationListQueryOptions(
    scope: PartyLocationScope,
    requestError: PartyLocationErrorFactory,
) {
    return infiniteQueryOptions({
        queryKey: geographyQueryKeys.partyLocationList(scope.viewerCacheKey, scope.partyId),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (page: PartyLocationPage, _pages, _param, params) =>
            page.next && !params.includes(page.next) ? page.next : undefined,
        retry: false,
        queryFn: async ({ pageParam, signal }) => {
            const response = await listPartyLocations({
                path: { party_id: scope.partyId },
                query: { limit: PARTY_LOCATION_PAGE_SIZE, ...(pageParam && { after: pageParam }) },
                signal,
                cache: "no-store",
            });
            if (response.error || !response.data) {
                throw requestError(response.response?.status, "read");
            }
            const page = mapToPartyLocationPage(response.data);
            if (page.items.some((location) => location.partyId !== scope.partyId)) {
                throw requestError(500, "read");
            }
            return page;
        },
    });
}

export function usePartyLocationList(scope: PartyLocationScope) {
    const requestError = usePartyLocationError();
    return useInfiniteQuery(partyLocationListQueryOptions(scope, requestError));
}

/**
 * Creates a location, or relocates one when `relocates` is set. One `Idempotency-Key` is kept per
 * unchanged command until its outcome is definite, so a retry after a lost response converges
 * on the original result instead of creating a duplicate location.
 */
export function useCreatePartyLocation(scope: PartyLocationScope) {
    const queryClient = useQueryClient();
    const requestError = usePartyLocationError();
    const pendingCommand = useRef<{ readonly body: string; readonly key: string }>(undefined);

    return useMutation({
        mutationFn: async (input: CreatePartyLocationInput) => {
            const operation = input.relocates ? "relocate" : "create";
            if (validatePartyLocationInput(input)) throw requestError(400, operation);
            const body = mapToBackendCreatePartyLocation(input);
            const serialized = JSON.stringify(body);
            if (pendingCommand.current?.body !== serialized) {
                pendingCommand.current = { body: serialized, key: createIdempotencyKey() };
            }
            const response = await createPartyLocation({
                path: { party_id: scope.partyId },
                headers: { "Idempotency-Key": pendingCommand.current.key },
                body,
                cache: "no-store",
            });
            if (response.error || !response.data) {
                // A network failure has no response status and leaves the outcome unknown.
                const error = requestError(response.response?.status, operation);
                if (!error.isIndefinite) pendingCommand.current = undefined;
                throw error;
            }
            pendingCommand.current = undefined;
            return requireLocation(response.data, scope, requestError, operation);
        },
        // A relocation also retires the old location; the list refetch shows both changes.
        onSuccess: (location) => storeLocation(queryClient, scope, location),
        onError: (error) => handleMutationError(queryClient, scope, error),
    });
}

export type CorrectPartyLocationResult = {
    readonly location: PartyLocation;
    /** The location already had these values; the backend recorded no change. */
    readonly unchanged: boolean;
};

export function useCorrectPartyLocation(scope: PartyLocationScope) {
    const queryClient = useQueryClient();
    const requestError = usePartyLocationError();
    return useMutation({
        mutationFn: async ({
            locationId,
            input,
        }: {
            readonly locationId: string;
            readonly input: CorrectPartyLocationInput;
        }): Promise<CorrectPartyLocationResult> => {
            if (validatePartyLocationInput(input)) throw requestError(400, "correct");
            const response = await correctPartyLocation({
                path: { party_id: scope.partyId, location_id: locationId },
                body: mapToBackendCorrectPartyLocation(input),
                cache: "no-store",
            });
            if (response.error || !response.data) {
                throw requestError(response.response?.status, "correct");
            }
            const location = requireLocation(response.data, scope, requestError, "correct");
            return { location, unchanged: location.revision === input.expectedRevision };
        },
        onSuccess: ({ location }) => storeLocation(queryClient, scope, location),
        onError: (error) => handleMutationError(queryClient, scope, error),
    });
}

/** Retirement or explicit restoration at the location's current revision. */
export function useSetPartyLocationLifecycle(scope: PartyLocationScope) {
    const queryClient = useQueryClient();
    const requestError = usePartyLocationError();
    return useMutation({
        mutationFn: async ({
            location,
            lifecycle,
        }: {
            readonly location: PartyLocation;
            readonly lifecycle: PartyLocationLifecycle;
        }) => {
            const response = await setPartyLocationLifecycle({
                path: { party_id: scope.partyId, location_id: location.id },
                body: mapToBackendSetPartyLocationLifecycle(lifecycle, location.revision),
                cache: "no-store",
            });
            if (response.error || !response.data) {
                throw requestError(response.response?.status, "lifecycle");
            }
            return requireLocation(response.data, scope, requestError, "lifecycle");
        },
        onSuccess: (location) => storeLocation(queryClient, scope, location),
        onError: (error) => handleMutationError(queryClient, scope, error),
    });
}
