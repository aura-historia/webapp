import { Controller, useFormContext } from "react-hook-form";
import type { ShopFilterSchema } from "@/components/search/ShopSearchFilters.tsx";
import { useTranslation } from "react-i18next";
import { CheckboxMultiSelect } from "@/components/ui/checkbox-multi-select.tsx";
import { useMemo } from "react";
import { SHOP_TYPES, SHOP_TYPE_TRANSLATION_CONFIG } from "@/data/internal/shop/ShopType.ts";
import { SHOP_FILTER_DEFAULTS } from "@/lib/shopFilterDefaults.ts";
import { FilterCard } from "./FilterCard.tsx";

export function ShopSearchShopTypeFilter() {
    const { control, setValue } = useFormContext<ShopFilterSchema>();
    const { t } = useTranslation();

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
            onReset={() => setValue("shopType", SHOP_FILTER_DEFAULTS.shopType)}
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
                        infoButtonLabel={t("common.infoButton")}
                    />
                )}
            />
        </FilterCard>
    );
}
