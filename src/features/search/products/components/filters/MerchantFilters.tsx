import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FilterCard } from "@/features/search/common/components/filters/FilterCard.tsx";
import type { FilterSchema } from "@/features/search/common/lib/filterForm.ts";
import { MerchantSourceFilter } from "@/features/search/products/components/filters/MerchantSourceFilter.tsx";
import { FILTER_DEFAULTS } from "@/features/search/products/lib/filterDefaults.ts";

type Props = {
    readonly disabled?: boolean;
};

export function MerchantFilters({ disabled = false }: Props) {
    const { t } = useTranslation();
    const { control, setValue } = useFormContext<FilterSchema>();
    const included = useWatch({ control, name: "listingSourceId" }) ?? [];
    const excluded = useWatch({ control, name: "excludeListingSourceId" }) ?? [];
    const count = included.length + excluded.length;

    const handleReset = () => {
        setValue("listingSourceId", FILTER_DEFAULTS.listingSourceId);
        setValue("listingSourceLabels", FILTER_DEFAULTS.listingSourceLabels);
        setValue("excludeListingSourceId", FILTER_DEFAULTS.excludeListingSourceId);
        setValue("excludeListingSourceLabels", FILTER_DEFAULTS.excludeListingSourceLabels);
    };

    return (
        <FilterCard
            title={t("search.filter.listingSources")}
            summary={
                count > 0 ? (
                    <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-pill bg-oxblood px-[5px] text-on-oxblood">
                        {count}
                    </span>
                ) : undefined
            }
            resetTooltip={t("search.filter.resetTooltip.listingSources")}
            onReset={handleReset}
            active={count > 0}
            disabled={disabled}
        >
            <div className="flex flex-col gap-4">
                <MerchantSourceFilter mode="include" />
                <MerchantSourceFilter mode="exclude" />
            </div>
        </FilterCard>
    );
}
