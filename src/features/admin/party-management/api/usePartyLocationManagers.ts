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
import { listPartyLocationManagers, setPartyLocationManagementGrant } from "@/client";
import { geographyQueryKeys } from "@/data/internal/geography/GeographyQueryKeys.ts";
import { mapToBackendPartyLocationManagementGrant } from "@/data/internal/geography/PartyLocation.ts";
import {
    type PartyLocationManager,
    type PartyLocationManagerPage,
    mapToPartyLocationManagerPage,
    mapToPartyLocationManagerQuery,
} from "@/data/internal/geography/PartyLocationManager.ts";
import { adminPartyDetailQueryKey } from "./useAdminParties.ts";

/** Under the `admin` root, so viewer changes clear the identities these reads return. */
export const partyLocationManagersQueryKey = (partyId: string) =>
    ["admin", "partyLocationManagers", partyId] as const;
const partyLocationManagerListQueryKey = (partyId: string) =>
    [...partyLocationManagersQueryKey(partyId), "list"] as const;
const partyLocationManagerUserQueryKey = (partyId: string, userId: string) =>
    [...partyLocationManagersQueryKey(partyId), "user", userId] as const;

export type PartyLocationManagementGrantInput = {
    readonly partyId: string;
    readonly userId: string;
    readonly granted: boolean;
};

type PartyLocationManagerOperation = "read" | "set";

export class PartyLocationManagementGrantError extends Error {
    constructor(
        message: string,
        /** Absent when no response arrived. */
        readonly status: number | undefined,
    ) {
        super(message);
    }
}

function errorKey(status: number | undefined, operation: PartyLocationManagerOperation): string {
    if (operation === "read") {
        if (status === 401 || status === 403)
            return "adminParties.locationAccess.errors.readForbidden";
        if (status === 404) return "adminParties.locationAccess.errors.readMissing";
        return "adminParties.locationAccess.errors.readFailed";
    }
    if (status === 401 || status === 403) return "adminParties.locationAccess.errors.forbidden";
    if (status === 404) return "adminParties.locationAccess.errors.missing";
    if (status === 409) return "adminParties.locationAccess.errors.conflict";
    if (status === 400) return "adminParties.locationAccess.errors.invalid";
    if (status === 503) return "adminParties.locationAccess.errors.unavailable";
    return "adminParties.locationAccess.errors.requestFailed";
}

export function createPartyLocationManagementGrantErrorFactory(t: TFunction) {
    // Problem details are not shown; only fixed, status-based copy reaches the UI.
    return (status: number | undefined, operation: PartyLocationManagerOperation = "set") =>
        new PartyLocationManagementGrantError(t(errorKey(status, operation)), status);
}

type ErrorFactory = ReturnType<typeof createPartyLocationManagementGrantErrorFactory>;

async function fetchPartyLocationManagers(
    partyId: string,
    options: { readonly userId?: string; readonly searchAfter?: string },
    signal: AbortSignal,
    requestError: ErrorFactory,
): Promise<PartyLocationManagerPage> {
    const response = await listPartyLocationManagers({
        path: { party_id: partyId },
        query: mapToPartyLocationManagerQuery(options),
        signal,
        cache: "no-store",
    });
    if (response.error || !response.data) throw requestError(response.response?.status, "read");
    return mapToPartyLocationManagerPage(response.data);
}

export function partyLocationManagerListQueryOptions(partyId: string, requestError: ErrorFactory) {
    return infiniteQueryOptions({
        queryKey: partyLocationManagerListQueryKey(partyId),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (page: PartyLocationManagerPage) => page.searchAfter,
        staleTime: 0,
        retry: false,
        queryFn: ({ pageParam, signal }) =>
            fetchPartyLocationManagers(partyId, { searchAfter: pageParam }, signal, requestError),
    });
}

export function partyLocationManagerQueryOptions(
    partyId: string,
    userId: string,
    requestError: ErrorFactory,
) {
    return queryOptions({
        queryKey: partyLocationManagerUserQueryKey(partyId, userId),
        staleTime: 0,
        retry: false,
        queryFn: async ({ signal }): Promise<PartyLocationManager | null> => {
            const page = await fetchPartyLocationManagers(
                partyId,
                { userId },
                signal,
                requestError,
            );
            return page.items.find((manager) => manager.userId === userId) ?? null;
        },
    });
}

function usePartyLocationManagerError() {
    const { t } = useTranslation();
    return createPartyLocationManagementGrantErrorFactory(t);
}

/** Users who can currently manage the Party's locations, with each independent reason. */
export function usePartyLocationManagers(partyId: string) {
    const requestError = usePartyLocationManagerError();
    return useInfiniteQuery(partyLocationManagerListQueryOptions(partyId, requestError));
}

/** One user's current access to the Party's locations; `null` when they have none. */
export function usePartyLocationManager(partyId: string, userId: string | undefined) {
    const requestError = usePartyLocationManagerError();
    return useQuery({
        ...partyLocationManagerQueryOptions(partyId, userId ?? "", requestError),
        enabled: Boolean(userId),
    });
}

/**
 * Sets or removes one user's explicit authority to manage a Party's locations. Partnership
 * membership is independent, so callers report only the confirmed command; the refreshed
 * manager reads show the resulting access.
 */
export function useSetPartyLocationManagementGrant() {
    const requestError = usePartyLocationManagerError();
    const queryClient = useQueryClient();

    // Protected location reads are authorization-dependent, so refresh every cached read of this
    // Party regardless of which viewer partition holds it.
    const invalidatePartyLocations = (partyId: string) =>
        queryClient.invalidateQueries({
            predicate: ({ queryKey }) =>
                queryKey[0] === geographyQueryKeys.partyLocations[0] && queryKey[2] === partyId,
        });
    const invalidateManagers = (partyId: string) =>
        queryClient.invalidateQueries({ queryKey: partyLocationManagersQueryKey(partyId) });

    return useMutation({
        mutationFn: async ({
            partyId,
            userId,
            granted,
        }: PartyLocationManagementGrantInput): Promise<PartyLocationManagementGrantInput> => {
            const response = await setPartyLocationManagementGrant({
                path: { party_id: partyId, user_id: userId },
                body: mapToBackendPartyLocationManagementGrant(granted),
                cache: "no-store",
            });
            if (response.error) throw requestError(response.response?.status);
            return { partyId, userId, granted };
        },
        onSuccess: ({ partyId }) => {
            void invalidateManagers(partyId);
            void invalidatePartyLocations(partyId);
        },
        onError: (error, { partyId }) => {
            if (!(error instanceof PartyLocationManagementGrantError)) return;
            if (error.status === 404) {
                void queryClient.invalidateQueries({ queryKey: adminPartyDetailQueryKey(partyId) });
            }
            if (error.status === 404 || error.status === 409) {
                void invalidateManagers(partyId);
                void invalidatePartyLocations(partyId);
            }
        },
    });
}
