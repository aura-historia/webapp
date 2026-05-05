import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { CheckboxMultiSelect } from "@/components/ui/checkbox-multi-select.tsx";
import { useMemo } from "react";
import { SHOP_TYPES, SHOP_TYPE_TRANSLATION_CONFIG } from "@/data/internal/shop/ShopType.ts";
import { FilterCard } from "./FilterCard.tsx";
import type { ShopType } from "@/data/internal/shop/ShopType.ts";

type ShopTypeFilterFormValues = {
    shopType?: ShopType[];
};

type ShopTypeFilterProps = {
    readonly onReset?: () => void;
    readonly shopTypes?: readonly ShopType[];
    readonly disabled?: boolean;
};

export function ShopTypeFilter({
    onReset,
    shopTypes = SHOP_TYPES,
    disabled = false,
}: ShopTypeFilterProps) {
    const { control } = useFormContext<ShopTypeFilterFormValues>();
    const { t } = useTranslation();

    const options = useMemo(
        () =>
            shopTypes.map((shopType) => ({
                value: shopType,
                label: t(SHOP_TYPE_TRANSLATION_CONFIG[shopType].translationKey),
            })),
        [shopTypes, t],
    );

    return (
        <FilterCard
            title={t("search.filter.shopType")}
            resetTooltip={t("search.filter.resetTooltip.shopType")}
            onReset={onReset}
            disabled={disabled}
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
