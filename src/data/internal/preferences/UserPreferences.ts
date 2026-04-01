import type { Currency } from "@/data/internal/common/Currency.ts";

export type UserPreferences = {
    trackingConsent?: boolean;
    currency?: Currency;
};
