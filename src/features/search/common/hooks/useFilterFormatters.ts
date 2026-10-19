import { format } from "date-fns";
import { de, enGB, es, fr, it, type Locale } from "date-fns/locale";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { Currency } from "@/data/internal/common/Currency.ts";
import { useUserPreferences } from "@/features/preferences/hooks/useUserPreferences.tsx";

const DATE_LOCALES: Record<string, Locale> = { de, en: enGB, es, fr, it };

/** The date-fns locale for an app language; English falls back to British day-month order. */
export function getDateLocale(language: string): Locale {
    return DATE_LOCALES[language.slice(0, 2)] ?? enGB;
}

/** Medium dates in the page language ("14 Nov 2026") and one- or two-sided date ranges. */
export function useDateFilterFormat() {
    const { t, i18n } = useTranslation();
    const dateLocale = useMemo(() => getDateLocale(i18n.language), [i18n.language]);

    const formatDate = useCallback(
        (date: Date) => format(date, "PP", { locale: dateLocale }),
        [dateLocale],
    );

    const formatDateRange = useCallback(
        (from?: Date, to?: Date) => {
            if (from && to) return `${formatDate(from)} – ${formatDate(to)}`;
            if (from) return t("search.filter.dateFromValue", { date: formatDate(from) });
            if (to) return t("search.filter.dateToValue", { date: formatDate(to) });
            return "";
        },
        [formatDate, t],
    );

    return { dateLocale, formatDate, formatDateRange };
}

/** Whole prices in the viewer's currency, as a range ("€800–€6,000") or one-sided. */
export function usePriceFilterFormat(currencyOverride?: Currency) {
    const { t, i18n } = useTranslation();
    const { preferences } = useUserPreferences();
    const currency = currencyOverride ?? preferences.currency;

    const priceFormat = useMemo(
        () =>
            new Intl.NumberFormat(i18n.language, {
                style: "currency",
                currency,
                maximumFractionDigits: 0,
            }),
        [i18n.language, currency],
    );

    const formatPriceRange = useCallback(
        (min?: number, max?: number) => {
            if (min != null && max != null) {
                return `${priceFormat.format(min)}–${priceFormat.format(max)}`;
            }
            if (min != null) {
                return t("search.filter.priceFromValue", { value: priceFormat.format(min) });
            }
            if (max != null) {
                return t("search.filter.priceToValue", { value: priceFormat.format(max) });
            }
            return "";
        },
        [priceFormat, t],
    );

    return { formatPriceRange };
}
