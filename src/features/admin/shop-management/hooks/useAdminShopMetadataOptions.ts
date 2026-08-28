import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { LanguageData } from "@/client";
import { COUNTRY_CODES } from "@/data/internal/shop/CountryCode.ts";
import { CURRENCIES } from "@/data/internal/common/Currency.ts";

export type AdminShopSelectOption = {
    readonly value: string;
    readonly label: string;
};

const SHOP_INGESTION_LANGUAGES = [
    "de",
    "en",
    "fr",
    "es",
    "it",
    "zh",
    "pt",
    "pl",
    "tr",
    "nl",
    "cs",
    "ja",
    "ru",
    "ar",
] as const satisfies readonly LanguageData[];

export function useAdminShopMetadataOptions() {
    const { i18n } = useTranslation();
    const displayLanguage = i18n.resolvedLanguage ?? i18n.language;

    const countryDisplayNames = useMemo(
        () =>
            typeof Intl.DisplayNames === "function"
                ? new Intl.DisplayNames([displayLanguage, "en"], {
                      type: "region",
                  })
                : null,
        [displayLanguage],
    );

    const currencyDisplayNames = useMemo(
        () =>
            typeof Intl.DisplayNames === "function"
                ? new Intl.DisplayNames([displayLanguage, "en"], {
                      type: "currency",
                  })
                : null,
        [displayLanguage],
    );

    const languageDisplayNames = useMemo(
        () =>
            typeof Intl.DisplayNames === "function"
                ? new Intl.DisplayNames([displayLanguage, "en"], {
                      type: "language",
                  })
                : null,
        [displayLanguage],
    );

    const countryOptions = useMemo<AdminShopSelectOption[]>(() => {
        return COUNTRY_CODES.map((code) => ({
            value: code,
            label: countryDisplayNames?.of(code) ?? code,
        })).sort((a, b) => a.label.localeCompare(b.label));
    }, [countryDisplayNames]);

    const currencyOptions = useMemo<AdminShopSelectOption[]>(() => {
        return CURRENCIES.map((currency) => ({
            value: currency,
            label: `${currencyDisplayNames?.of(currency) ?? currency} (${currency})`,
        })).sort((a, b) => a.label.localeCompare(b.label));
    }, [currencyDisplayNames]);

    const languageOptions = useMemo<AdminShopSelectOption[]>(() => {
        return SHOP_INGESTION_LANGUAGES.map((language) => ({
            value: language,
            label: languageDisplayNames?.of(language) ?? language,
        })).sort((a, b) => a.label.localeCompare(b.label));
    }, [languageDisplayNames]);

    return { countryOptions, currencyOptions, languageOptions };
}
