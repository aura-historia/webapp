import { useCallback, useEffect } from "react";
import { parseUnitSystem, type UnitSystem } from "@/data/internal/common/UnitSystem.ts";
import { useUpdateUserAccount } from "@/features/account-management/hooks/usePatchUserAccount.ts";
import { useUserAccount } from "@/features/account-management/hooks/useUserAccount.ts";
import { useResolvedAuth } from "@/features/authentication/hooks/useResolvedAuth.ts";
import { useUserPreferences } from "@/features/preferences/hooks/useUserPreferences.tsx";

/** The visitor's unit system, kept in sync with the signed-in account. */
export function useUnitSystemPreference(): {
    readonly unitSystem: UnitSystem;
    readonly setUnitSystem: (value: string) => void;
} {
    const { preferences, updatePreferences } = useUserPreferences();
    const { mutate: updateAccount } = useUpdateUserAccount();
    const { data: account } = useUserAccount();
    const { isAuthenticated } = useResolvedAuth();

    // On login: backend unit system overwrites local preference to stay in sync across devices
    useEffect(() => {
        if (account?.unitSystem) {
            updatePreferences({ unitSystem: account.unitSystem });
        }
    }, [account?.unitSystem, updatePreferences]);

    const setUnitSystem = useCallback(
        (value: string) => {
            const newUnitSystem = parseUnitSystem(value);
            updatePreferences({ unitSystem: newUnitSystem });
            if (isAuthenticated) {
                updateAccount({ unitSystem: newUnitSystem });
            }
        },
        [isAuthenticated, updatePreferences, updateAccount],
    );

    return { unitSystem: preferences.unitSystem, setUnitSystem };
}
