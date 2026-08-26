import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import type { FilterSchema } from "@/features/search/common/lib/filterForm.ts";
import { FILTER_DEFAULTS } from "@/features/search/products/lib/filterDefaults.ts";
import { SellerIncludeFilter } from "@/features/search/products/components/filters/SellerIncludeFilter.tsx";
import { SellerExcludeFilter } from "@/features/search/products/components/filters/SellerExcludeFilter.tsx";
import { FilterCard } from "@/features/search/common/components/filters/FilterCard.tsx";

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
