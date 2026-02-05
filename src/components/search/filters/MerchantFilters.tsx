import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import type { FilterSchema } from "@/components/search/SearchFilters.tsx";
import { FILTER_DEFAULTS } from "@/lib/filterDefaults.ts";
import { MerchantIncludeFilter } from "@/components/search/filters/MerchantIncludeFilter.tsx";
import { MerchantExcludeFilter } from "@/components/search/filters/MerchantExcludeFilter.tsx";
import { FilterCard } from "./FilterCard.tsx";

export function MerchantFilters() {
    const { t } = useTranslation();
    const { setValue } = useFormContext<FilterSchema>();

    const handleReset = () => {
        setValue("merchant", FILTER_DEFAULTS.merchant);
        setValue("excludeMerchant", FILTER_DEFAULTS.excludeMerchant);
    };

    return (
        <FilterCard
            title={t("search.filter.merchants")}
            resetTooltip={t("search.filter.resetTooltip.merchants")}
            onReset={handleReset}
        >
            <div className="flex flex-col gap-4">
                <MerchantIncludeFilter />
                <MerchantExcludeFilter />
            </div>
        </FilterCard>
    );
}
