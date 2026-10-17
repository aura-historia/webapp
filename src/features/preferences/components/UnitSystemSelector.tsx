import { UNIT_SYSTEMS } from "@/data/internal/common/UnitSystem.ts";
import { useUnitSystemPreference } from "@/features/preferences/hooks/useUnitSystemPreference.ts";
import { useTranslation } from "react-i18next";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function UnitSystemSelector() {
    const { unitSystem, setUnitSystem } = useUnitSystemPreference();
    const { t } = useTranslation();

    return (
        <Select value={unitSystem} onValueChange={setUnitSystem}>
            <SelectTrigger className="h-8 gap-2 border-outline-variant/20 bg-transparent text-sm text-primary/80 transition-colors duration-300 ease-out hover:text-primary">
                <SelectValue>
                    {t("common.unitSystemPrefix")}: {t(`auth.unitSystems.${unitSystem}`)}
                </SelectValue>
            </SelectTrigger>
            <SelectContent align="end" className="max-h-60 overflow-hidden rounded-md">
                {UNIT_SYSTEMS.map((option) => (
                    <SelectItem key={option} value={option}>
                        {t(`auth.unitSystems.${option}`)}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
