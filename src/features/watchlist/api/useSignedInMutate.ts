import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useResolvedAuth } from "@/features/authentication/hooks/useResolvedAuth.ts";

/**
 * Wraps a watchlist `mutate` so signed-out viewers get the sign-in notice instead of a request.
 * No mutation starts, so the pending-state overlay never shows the listing as watched.
 * While auth is still resolving the call goes through; the API's 401 is the fallback.
 */
export function useSignedInMutate<TArgs extends unknown[]>(
    mutate: (...args: TArgs) => void,
): (...args: TArgs) => void {
    const { user, isResolved } = useResolvedAuth();
    const { t } = useTranslation();
    const signedOut = isResolved && !user;

    return useCallback(
        (...args: TArgs) => {
            if (signedOut) {
                toast.info(t("watchlist.loginRequired"));
                return;
            }
            mutate(...args);
        },
        [signedOut, mutate, t],
    );
}
