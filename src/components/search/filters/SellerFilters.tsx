import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import type { FilterSchema } from "@/components/search/SearchFilters.tsx";
import { FILTER_DEFAULTS } from "@/lib/filterDefaults.ts";
import { SellerIncludeFilter } from "@/components/search/filters/SellerIncludeFilter.tsx";
import { SellerExcludeFilter } from "@/components/search/filters/SellerExcludeFilter.tsx";
import { FilterCard } from "./FilterCard.tsx";

type Props = {
    readonly disabled?: boolean;
};

export function SellerFilters({ disabled = false }: Props) {
    const { t } = useTranslation();
    const { setValue } = useFormContext<FilterSchema>();

    const handleReset = () => {
        setValue("seller", FILTER_DEFAULTS.seller);
        setValue("excludeSeller", FILTER_DEFAULTS.excludeSeller);
    };

    return (
        <FilterCard
            title={t("search.filter.sellers")}
            resetTooltip={t("search.filter.resetTooltip.sellers")}
            onReset={handleReset}
            disabled={disabled}
        >
            <div className="flex flex-col gap-4">
                <SellerIncludeFilter />
                <SellerExcludeFilter />
            </div>
        </FilterCard>
    );
}
