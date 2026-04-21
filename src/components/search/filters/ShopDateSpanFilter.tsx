import { DatePicker } from "@/components/search/filters/util/DatePicker.tsx";
import { useFormContext, useFormState } from "react-hook-form";
import type { ShopFilterSchema } from "@/components/search/ShopSearchFilters.tsx";
import { useTranslation } from "react-i18next";
import { SHOP_FILTER_DEFAULTS } from "@/lib/shopFilterDefaults.ts";
import { FilterCard } from "./FilterCard.tsx";

type ShopDateFilterProps = {
    readonly field: "creationDate" | "updateDate";
    readonly title: string;
    readonly resetTooltip: string;
};

export function ShopDateSpanFilter({ field, title, resetTooltip }: ShopDateFilterProps) {
    const { control, setValue } = useFormContext<ShopFilterSchema>();
    const { errors } = useFormState({ control, name: [`${field}.to`] });
    const { t } = useTranslation();

    return (
        <FilterCard
            title={title}
            resetTooltip={resetTooltip}
            onReset={() => setValue(field, SHOP_FILTER_DEFAULTS[field])}
            defaultOpen={false}
        >
            <div className="flex min-w-0 w-full flex-col gap-2">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="shrink-0 text-xs font-semibold tracking-[0.08em] uppercase text-on-surface-variant">
                        {t("search.filter.from")}
                    </span>
                    <div className="min-w-0 flex-1">
                        <DatePicker<ShopFilterSchema> fieldName={`${field}.from`} />
                    </div>
                </div>
                <div className="flex min-w-0 items-center gap-3">
                    <span className="shrink-0 text-xs font-semibold tracking-[0.08em] uppercase text-on-surface-variant">
                        {t("search.filter.to")}
                    </span>
                    <div className="min-w-0 flex-1">
                        <DatePicker<ShopFilterSchema> fieldName={`${field}.to`} />
                    </div>
                </div>
                {errors?.[field]?.to && (
                    <p className="text-destructive text-sm mt-1">
                        {errors[field]?.to?.message ?? ""}
                    </p>
                )}
            </div>
        </FilterCard>
    );
}
