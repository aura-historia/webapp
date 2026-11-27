import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getBrowsingDestination, setBrowsingDestination } from "@/client";
import { geographyQueryKeys } from "@/data/internal/geography/GeographyQueryKeys.ts";
import {
    type BrowsingDestinationView,
    isValidBrowsingDestination,
    mapToBackendSetBrowsingDestination,
    mapToBrowsingDestinationView,
    type WritableBrowsingDestination,
} from "@/data/internal/geography/UserAddress.ts";
import { UserAddressRequestError } from "@/features/account-management/hooks/useUserAddresses.ts";

/**
 * The signed-in user's browsing destination ("search location"): private, `no-store`, no retries.
 * An untouched preference reads as `NONE`.
 */
export function useBrowsingDestination(viewerCacheKey: string, enabled = true) {
    const { t } = useTranslation();
    return useQuery({
        queryKey: geographyQueryKeys.browsingDestination(viewerCacheKey),
        enabled,
        retry: false,
        queryFn: async ({ signal }): Promise<BrowsingDestinationView> => {
            const response = await getBrowsingDestination({ signal, cache: "no-store" });
            if (response.error || !response.data) {
                throw new UserAddressRequestError(
                    t("account.addresses.searchLocationLoadError"),
                    response.response?.status,
                );
            }
            return mapToBrowsingDestinationView(response.data);
        },
    });
}

/** What the last failed save needs the switches to show. */
export type BrowsingDestinationSaveProblem = "conflict" | "addressGone" | "accessLost" | "failed";

/**
 * Replaces the browsing destination at the version that was read. Never retried: a `409` refetches
 * the authoritative destination, so the switches show it; a `404` (the chosen address is gone)
 * refetches the addresses and the destination. Success refreshes the addresses, whose `preferred`
 * flag follows the destination.
 */
export function useSetBrowsingDestination(viewerCacheKey: string) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [problem, setProblem] = useState<BrowsingDestinationSaveProblem>();
    const destinationKey = geographyQueryKeys.browsingDestination(viewerCacheKey);
    const addressesKey = [...geographyQueryKeys.userAddresses, viewerCacheKey] as const;

    const mutation = useMutation({
        retry: false,
        mutationFn: async ({
            destination,
            expectedVersion,
        }: {
            readonly destination: WritableBrowsingDestination;
            readonly expectedVersion: number;
        }) => {
            const fail = (status: number | undefined) =>
                new UserAddressRequestError(
                    t("account.addresses.toasts.searchLocationFailed"),
                    status,
                );
            if (!isValidBrowsingDestination(destination)) throw fail(400);
            const response = await setBrowsingDestination({
                body: mapToBackendSetBrowsingDestination(destination, expectedVersion),
                cache: "no-store",
            });
            if (response.error || !response.data) throw fail(response.response?.status);
            return mapToBrowsingDestinationView(response.data);
        },
        onMutate: () => setProblem(undefined),
        onSuccess: (view) => {
            queryClient.setQueryData(destinationKey, view);
            void queryClient.invalidateQueries({ queryKey: addressesKey });
        },
        onError: (error) => {
            if (!(error instanceof UserAddressRequestError)) {
                setProblem("failed");
                return;
            }
            if (error.isAccessLoss) {
                setProblem("accessLost");
                void queryClient.resetQueries({ queryKey: destinationKey });
                void queryClient.resetQueries({ queryKey: addressesKey });
            } else if (error.isConflict) {
                setProblem("conflict");
                void queryClient.invalidateQueries({ queryKey: destinationKey });
            } else if (error.isNotFound) {
                setProblem("addressGone");
                void queryClient.invalidateQueries({ queryKey: addressesKey });
                void queryClient.invalidateQueries({ queryKey: destinationKey });
            } else {
                setProblem("failed");
            }
        },
    });

    return { ...mutation, problem };
}
