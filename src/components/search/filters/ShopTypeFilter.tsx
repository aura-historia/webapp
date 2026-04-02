import { Controller, useFormContext } from "react-hook-form";
import type { FilterSchema } from "@/components/search/SearchFilters.tsx";
import { useTranslation } from "react-i18next";
import { useFilterNavigation } from "@/hooks/search/useFilterNavigation.ts";
import { CheckboxMultiSelect } from "@/components/ui/checkbox-multi-select.tsx";
import { useMemo } from "react";
import { SHOP_TYPES, SHOP_TYPE_TRANSLATION_CONFIG } from "@/data/internal/shop/ShopType.ts";
import { FilterCard } from "./FilterCard.tsx";

export function ShopTypeFilter() {
    const { control } = useFormContext<FilterSchema>();
    const { t } = useTranslation();
    const resetAndNavigate = useFilterNavigation();

    const options = useMemo(
        () =>
            SHOP_TYPES.map((shopType) => ({
                value: shopType,
                label: t(SHOP_TYPE_TRANSLATION_CONFIG[shopType].translationKey),
            })),
        [t],
    );

    return (
        <FilterCard
            title={t("search.filter.shopType")}
            resetTooltip={t("search.filter.resetTooltip.shopType")}
            onReset={() => resetAndNavigate("shopType")}
        >
            <Controller
                name="shopType"
                control={control}
                render={({ field }) => (
                    <CheckboxMultiSelect
                        options={options}
                        value={field.value ?? []}
                        onChange={field.onChange}
                        allSelectedLabel={t("search.filter.all")}
                        placeholder={t("search.filter.select")}
                    />
                )}
            />
        </FilterCard>
    );
}
