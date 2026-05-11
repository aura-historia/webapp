import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getCategoriesOptions, getPeriodsOptions } from "@/client/@tanstack/react-query.gen.ts";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import { COUNTRY_CODES } from "@/data/internal/shop/CountryCode.ts";

export type AdminShopSelectOption = {
    readonly value: string;
    readonly label: string;
};

export function useAdminShopMetadataOptions() {
    const { i18n } = useTranslation();
    const language = parseLanguage(i18n.language);
    const displayLanguage = i18n.resolvedLanguage ?? i18n.language;

    const { data: categoriesData, isPending: isCategoriesPending } = useQuery(
        getCategoriesOptions({
            query: { language },
        }),
    );
    const { data: periodsData, isPending: isPeriodsPending } = useQuery(
        getPeriodsOptions({
            query: { language },
        }),
    );

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
    const categoryOptions = useMemo<AdminShopSelectOption[]>(
        () =>
            (categoriesData ?? []).map((category) => ({
                value: category.categoryId,
                label: category.name.text,
            })),
        [categoriesData],
    );
    const periodOptions = useMemo<AdminShopSelectOption[]>(
        () =>
            (periodsData ?? []).map((period) => ({
                value: period.periodId,
                label: period.name.text,
            })),
        [periodsData],
    );

    return {
        categoryOptions,
        countryOptions,
        isCategoriesPending,
        isPeriodsPending,
        periodOptions,
    };
}
