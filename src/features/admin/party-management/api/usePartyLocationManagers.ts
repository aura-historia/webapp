import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { setPartyLocationManagementGrant } from "@/client";
import { geographyQueryKeys } from "@/data/internal/geography/GeographyQueryKeys.ts";
import { mapToBackendPartyLocationManagementGrant } from "@/data/internal/geography/PartyLocation.ts";
import { adminPartyDetailQueryKey } from "./useAdminParties.ts";

export type PartyLocationManagementGrantInput = {
    readonly partyId: string;
    readonly userId: string;
    readonly granted: boolean;
};

export class PartyLocationManagementGrantError extends Error {
    constructor(
        message: string,
        /** Absent when no response arrived. */
        readonly status: number | undefined,
    ) {
        super(message);
    }
}

function errorKey(status: number | undefined): string {
    if (status === 401 || status === 403) return "adminParties.locationAccess.errors.forbidden";
    if (status === 404) return "adminParties.locationAccess.errors.missing";
    if (status === 409) return "adminParties.locationAccess.errors.conflict";
    if (status === 400) return "adminParties.locationAccess.errors.invalid";
    if (status === 503) return "adminParties.locationAccess.errors.unavailable";
    return "adminParties.locationAccess.errors.requestFailed";
}

export function createPartyLocationManagementGrantErrorFactory(t: TFunction) {
    // Problem details are not shown; only fixed, status-based copy reaches the UI.
    return (status: number | undefined) =>
        new PartyLocationManagementGrantError(t(errorKey(status)), status);
}

/**
 * Sets or removes one user's explicit authority to manage a Party's locations. The contract has
 * no grant-state read, so callers report only the confirmed command, never a current state.
 */
export function useSetPartyLocationManagementGrant() {
    const { t } = useTranslation();
    const requestError = createPartyLocationManagementGrantErrorFactory(t);
    const queryClient = useQueryClient();

    // Protected location reads are authorization-dependent, so refresh every cached read of this
    // Party regardless of which viewer partition holds it.
    const invalidatePartyLocations = (partyId: string) =>
        queryClient.invalidateQueries({
            predicate: ({ queryKey }) =>
                queryKey[0] === geographyQueryKeys.partyLocations[0] && queryKey[2] === partyId,
        });

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
            void invalidatePartyLocations(partyId);
        },
        onError: (error, { partyId }) => {
            if (!(error instanceof PartyLocationManagementGrantError)) return;
            if (error.status === 404) {
                void queryClient.invalidateQueries({ queryKey: adminPartyDetailQueryKey(partyId) });
            }
            if (error.status === 404 || error.status === 409)
                void invalidatePartyLocations(partyId);
        },
    });
}
