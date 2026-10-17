import { useCallback, useEffect } from "react";
import { type Currency, parseCurrency } from "@/data/internal/common/Currency.ts";
import { useUpdateUserAccount } from "@/features/account-management/hooks/usePatchUserAccount.ts";
import { useUserAccount } from "@/features/account-management/hooks/useUserAccount.ts";
import { useResolvedAuth } from "@/features/authentication/hooks/useResolvedAuth.ts";
import { useUserPreferences } from "@/features/preferences/hooks/useUserPreferences.tsx";

/** The visitor's display currency, kept in sync with the signed-in account. */
export function useCurrencyPreference(): {
    readonly currency: Currency;
    readonly setCurrency: (value: string) => void;
} {
    const { preferences, updatePreferences } = useUserPreferences();
    const { mutate: updateAccount } = useUpdateUserAccount();
    const { data: account } = useUserAccount();
    const { isAuthenticated } = useResolvedAuth();

    // On login: backend currency overwrites local preference to stay in sync across devices
    useEffect(() => {
        if (account?.currency) {
            updatePreferences({ currency: account.currency });
        }
    }, [account?.currency, updatePreferences]);

    const setCurrency = useCallback(
        (value: string) => {
            const newCurrency = parseCurrency(value);
            updatePreferences({ currency: newCurrency });
            if (isAuthenticated) {
                updateAccount({ currency: newCurrency });
            }
        },
        [isAuthenticated, updatePreferences, updateAccount],
    );

    return { currency: preferences.currency, setCurrency };
}
