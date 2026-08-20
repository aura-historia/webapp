import type { Currency } from "@/data/internal/common/Currency.ts";
import type { UnitSystem } from "@/data/internal/common/UnitSystem.ts";

export type UserPreferences = {
    trackingConsent?: boolean;
    externalMapConsent?: boolean;
    currency: Currency;
    unitSystem: UnitSystem;
};
