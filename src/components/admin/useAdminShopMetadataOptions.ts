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

    const countryOptions = useMemo<AdminShopSelectOption[]>(
        () => COUNTRY_CODES.map((code) => ({ value: code, label: code })),
        [],
    );
    const categoryOptions = useMemo<AdminShopSelectOption[]>(
        () =>
            (categoriesData ?? []).map((category) => ({
                value: category.categoryId,
                label: `${category.name.text} (${category.categoryId})`,
            })),
        [categoriesData],
    );
    const periodOptions = useMemo<AdminShopSelectOption[]>(
        () =>
            (periodsData ?? []).map((period) => ({
                value: period.periodId,
                label: `${period.name.text} (${period.periodId})`,
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
