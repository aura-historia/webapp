import { useUserPreferences } from "@/hooks/preferences/useUserPreferences.tsx";
import type { Currency } from "@/data/internal/common/Currency.ts";

export function useCurrency(): Currency {
    const { preferences } = useUserPreferences();
    return preferences.currency;
}
