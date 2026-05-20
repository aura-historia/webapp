import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { COUNTRY_CODES } from "@/data/internal/shop/CountryCode.ts";

export type AdminShopSelectOption = {
    readonly value: string;
    readonly label: string;
};

export function useAdminShopMetadataOptions() {
    const { i18n } = useTranslation();
    const displayLanguage = i18n.resolvedLanguage ?? i18n.language;

    const countryOptions = useMemo<AdminShopSelectOption[]>(() => {
        const displayNames =
            typeof Intl.DisplayNames === "function"
                ? new Intl.DisplayNames([displayLanguage, "en"], {
                      type: "region",
                  })
                : null;

        return COUNTRY_CODES.map((code) => ({
            value: code,
            label: displayNames?.of(code) ?? code,
        })).sort((a, b) => a.label.localeCompare(b.label));
    }, [displayLanguage]);

    return { countryOptions };
}
