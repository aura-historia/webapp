import { Controller, useFormContext } from "react-hook-form";
import type { ShopFilterSchema } from "@/components/search/ShopSearchFilters.tsx";
import { useTranslation } from "react-i18next";
import { CheckboxMultiSelect } from "@/components/ui/checkbox-multi-select.tsx";
import { useMemo } from "react";
import {
    SHOP_PARTNER_STATUSES,
    SHOP_PARTNER_STATUS_TRANSLATION_CONFIG,
} from "@/data/internal/shop/ShopPartnerStatus.ts";
import { SHOP_FILTER_DEFAULTS } from "@/lib/shopFilterDefaults.ts";
import { FilterCard } from "./FilterCard.tsx";

export function ShopPartnerStatusFilter() {
    const { control, setValue } = useFormContext<ShopFilterSchema>();
    const { t } = useTranslation();

    const options = useMemo(
        () =>
            SHOP_PARTNER_STATUSES.map((status) => ({
                value: status,
                label: t(SHOP_PARTNER_STATUS_TRANSLATION_CONFIG[status].translationKey),
            })),
        [t],
    );

    return (
        <FilterCard
            title={t("search.filter.partnerStatus")}
            resetTooltip={t("search.filter.resetTooltip.partnerStatus")}
            onReset={() => setValue("partnerStatus", SHOP_FILTER_DEFAULTS.partnerStatus)}
        >
            <Controller
                name="partnerStatus"
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
