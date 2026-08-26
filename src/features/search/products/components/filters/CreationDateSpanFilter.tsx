import { DatePicker } from "@/features/search/common/components/filters/util/DatePicker.tsx";
import { useFormContext, useFormState } from "react-hook-form";
import type { FilterSchema } from "@/features/search/common/lib/filterForm.ts";
import { useTranslation } from "react-i18next";
import { useFilterNavigation } from "@/features/search/products/hooks/useFilterNavigation.ts";
import { FilterCard } from "@/features/search/common/components/filters/FilterCard.tsx";

type Props = {
    readonly defaultOpen?: boolean;
    readonly disabled?: boolean;
};

export function CreationDateSpanFilter({ defaultOpen = false, disabled = false }: Props) {
    const { control } = useFormContext<FilterSchema>();
    const { errors } = useFormState({ control, name: ["creationDate.to"] });
    const { t } = useTranslation();
    const resetAndNavigate = useFilterNavigation();

    return (
        <FilterCard
            title={t("search.filter.creationDate")}
            resetTooltip={t("search.filter.resetTooltip.creationDate")}
            onReset={() => resetAndNavigate("creationDate")}
            defaultOpen={defaultOpen}
            disabled={disabled}
        >
            <div className="flex min-w-0 w-full flex-col gap-2">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="shrink-0 text-xs font-semibold tracking-[0.08em] uppercase text-on-surface-variant">
                        {t("search.filter.from")}
                    </span>
                    <div className="min-w-0 flex-1">
                        <DatePicker fieldName="creationDate.from" />
                    </div>
                </div>
                <div className="flex min-w-0 items-center gap-3">
                    <span className="shrink-0 text-xs font-semibold tracking-[0.08em] uppercase text-on-surface-variant">
                        {t("search.filter.to")}
                    </span>
                    <div className="min-w-0 flex-1">
                        <DatePicker fieldName="creationDate.to" />
                    </div>
                </div>
                {errors?.creationDate?.to && (
                    <p className="text-destructive text-sm mt-1">
                        {errors.creationDate.to.message ?? ""}
                    </p>
                )}
            </div>
        </FilterCard>
    );
}
