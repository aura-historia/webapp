import { UNIT_SYSTEMS, parseUnitSystem } from "@/data/internal/common/UnitSystem.ts";
import { useUserPreferences } from "@/features/preferences/hooks/useUserPreferences.tsx";
import { useUpdateUserAccount } from "@/features/account-management/hooks/usePatchUserAccount.ts";
import { useUserAccount } from "@/features/account-management/hooks/useUserAccount.ts";
import { useResolvedAuth } from "@/features/authentication/hooks/useResolvedAuth.ts";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function UnitSystemSelector() {
    const { preferences, updatePreferences } = useUserPreferences();
    const { mutate: updateAccount } = useUpdateUserAccount();
    const { data: account } = useUserAccount();
    const { isAuthenticated } = useResolvedAuth();
    const { t } = useTranslation();

    // On login: backend unit system overwrites local preference to stay in sync across devices
    useEffect(() => {
        if (account?.unitSystem) {
            updatePreferences({ unitSystem: account.unitSystem });
        }
    }, [account?.unitSystem, updatePreferences]);

    const handleChange = useCallback(
        (value: string) => {
            const newUnitSystem = parseUnitSystem(value);
            updatePreferences({ unitSystem: newUnitSystem });
            if (isAuthenticated) {
                updateAccount({ unitSystem: newUnitSystem });
            }
        },
        [isAuthenticated, updatePreferences, updateAccount],
    );

    return (
        <Select value={preferences.unitSystem} onValueChange={handleChange}>
            <SelectTrigger className="h-8 gap-2 border-outline-variant/20 bg-transparent text-sm text-primary/80 transition-colors duration-300 ease-out hover:text-primary">
                <SelectValue>
                    {t("common.unitSystemPrefix")}:{" "}
                    {t(`auth.unitSystems.${preferences.unitSystem}`)}
                </SelectValue>
            </SelectTrigger>
            <SelectContent align="end" className="max-h-60 overflow-hidden rounded-md">
                {UNIT_SYSTEMS.map((unitSystem) => (
                    <SelectItem key={unitSystem} value={unitSystem}>
                        {t(`auth.unitSystems.${unitSystem}`)}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
