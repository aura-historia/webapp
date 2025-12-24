import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@tanstack/react-store";
import { useEffect, useState } from "react";
import { registrationStore, clearPendingUserData } from "@/stores/registrationStore";
import { updateUserAccount } from "@/client";
import {
    mapToInternalUserAccount,
    mapToBackendUserAccountPatch,
} from "@/data/internal/UserAccountData";
import { mapToInternalApiError } from "@/data/internal/ApiError";
import { useApiError } from "@/hooks/useApiError";

export function useRegistrationPolling() {
    const pendingData = useStore(registrationStore, (state) => state.pendingUserData);
    const [isPolling, setIsPolling] = useState(false);
    const [isDone, setIsDone] = useState(false);
    const { getErrorMessage } = useApiError();
    const queryClient = useQueryClient();

    // Poll PATCH /api/v1/me/account every 500ms (for 10 seconds) until user exists in backend
    const polling = useQuery({
        queryKey: ["user-polling"],
        queryFn: async () => {
            // Defensive check - should never happen due to enabled guard, but makes TypeScript happy and I don't do dirty "non-null assertion"
            if (!pendingData) {
                throw new Error("Cannot execute PATCH: no pending data available");
            }

            const patchPayload = mapToBackendUserAccountPatch(pendingData);
            const response = await updateUserAccount({ body: patchPayload });

            if (response.error) {
                // 404 = user doesn't exist yet (Lambda still creating user)
                if (response.error.status === 404) {
                    throw new Error("POLLING_404");
                }

                // Any other error is a real failure (500, 401, etc.)
                throw new Error(getErrorMessage(mapToInternalApiError(response.error)));
            }

            const userData = mapToInternalUserAccount(response.data);

            // Update cache immediately with fresh data from PATCH response
            queryClient.setQueryData(["userAccount"], userData);

            return userData;
        },

        // Only poll when explicitly started via start() AND when there's data to patch
        enabled:
            isPolling &&
            !!(
                pendingData &&
                (pendingData.firstName ||
                    pendingData.lastName ||
                    pendingData.language ||
                    pendingData.currency)
            ),

        // Retry only on 404, max 20 attempts (initial + 19 retries = 20 total)
        retry: (failureCount, error) => {
            return error.message === "POLLING_404" && failureCount < 19;
        },

        retryDelay: 500,

        // Disable automatic refetches - we control polling manually
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });

    // Timeout = all 20 polling attempts failed with 404
    const isTimeout =
        polling.isError && polling.error?.message === "POLLING_404" && polling.failureCount >= 19;

    useEffect(() => {
        // Check if there's actually data to patch (at least one field filled)
        const hasPendingData = !!(
            pendingData &&
            (pendingData.firstName ||
                pendingData.lastName ||
                pendingData.language ||
                pendingData.currency)
        );

        // No custom fields to patch - registration complete without PATCH
        if (!hasPendingData && !isDone) {
            clearPendingUserData();
            setIsDone(true);
            return;
        }

        // Handle timeout: clean up store even though user was never found
        if (isTimeout && !isDone) {
            clearPendingUserData();
            setIsDone(true);
            return;
        }

        // Handle other errors (500, 401, etc.): clean up store and mark as done
        if (polling.isError && !isTimeout && !isDone) {
            clearPendingUserData();
            setIsDone(true);
            return;
        }

        // Early return if any of these conditions are true
        if (!polling.data || isDone) {
            return;
        }

        // If user found - stop polling
        setIsPolling(false);

        // Registration complete - user found and updated with custom fields
        clearPendingUserData();
        setIsDone(true);
    }, [polling.data, isDone, pendingData, isTimeout, polling.isError]);

    // Return values used by CompleteRegistration component:
    // - start(): Trigger polling process
    // - isLoading: Show spinner during polling/PATCH
    // - isDone: Navigate when complete
    // - isTimeout: Show timeout message (20 attempts failed)
    // - isError: Show error message (real backend errors)
    // - errorMessage: Translated error text for display
    return {
        start: () => {
            if (isPolling || isDone) return;

            setIsPolling(true);
            setIsDone(false);
        },
        isLoading: isPolling,
        isDone,
        isTimeout,
        isError: polling.isError && !isTimeout,
        errorMessage: polling.error?.message,
    };
}
