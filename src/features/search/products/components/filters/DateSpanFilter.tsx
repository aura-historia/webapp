import { CircleAlert } from "lucide-react";
import { useId } from "react";
import { useFormContext, useFormState, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FilterCard } from "@/features/search/common/components/filters/FilterCard.tsx";
import { DatePicker } from "@/features/search/common/components/filters/util/DatePicker.tsx";
import { useDateFilterFormat } from "@/features/search/common/hooks/useFilterFormatters.ts";
import type { FilterSchema } from "@/features/search/common/lib/filterForm.ts";
import type { DateFilterKey } from "@/features/search/products/lib/activeFilters.ts";
import { useFilterNavigation } from "@/features/search/products/hooks/useFilterNavigation.ts";

type DateSpanFilterProps = {
    readonly defaultOpen?: boolean;
    readonly disabled?: boolean;
};

/** From and To date fields for one date range of the filter form. */
function DateSpanFilter({
    field,
    defaultOpen = false,
    disabled = false,
}: DateSpanFilterProps & { readonly field: DateFilterKey }) {
    const { control } = useFormContext<FilterSchema>();
    const { errors } = useFormState({ control, name: [`${field}.from`, `${field}.to`] });
    const range = useWatch({ control, name: field });
    const { t } = useTranslation();
    const { formatDateRange } = useDateFilterFormat();
    const resetAndNavigate = useFilterNavigation();
    const errorId = useId();
    const title = t(`search.filter.${field}`);
    const error = errors?.[field]?.from?.message ?? errors?.[field]?.to?.message;
    const isActive = Boolean(range?.from || range?.to);

    return (
        <FilterCard
            title={title}
            summary={isActive ? formatDateRange(range?.from, range?.to) : undefined}
            resetTooltip={t(`search.filter.resetTooltip.${field}`)}
            onReset={() => resetAndNavigate(field)}
            active={isActive}
            defaultOpen={defaultOpen}
            disabled={disabled}
        >
            <div className="grid grid-cols-[44px_minmax(0,1fr)] items-center gap-x-2.5 gap-y-2">
                <span className="text-meta text-ink-secondary">{t("search.filter.from")}</span>
                <DatePicker
                    fieldName={`${field}.from`}
                    label={t("search.filter.dateFromLabel", { filter: title })}
                    disabled={disabled}
                />
                <span className="text-meta text-ink-secondary">{t("search.filter.to")}</span>
                <DatePicker
                    fieldName={`${field}.to`}
                    label={t("search.filter.dateToLabel", { filter: title })}
                    disabled={disabled}
                    invalid={Boolean(error)}
                    describedBy={error ? errorId : undefined}
                />
                {error && (
                    <p
                        id={errorId}
                        role="alert"
                        className="col-start-2 flex items-center gap-1.5 text-meta text-oxblood"
                    >
                        <CircleAlert
                            aria-hidden="true"
                            className="size-3.5 shrink-0"
                            strokeWidth={2}
                        />
                        {error}
                    </p>
                )}
            </div>
        </FilterCard>
    );
}

export function AuctionDateSpanFilter(props: DateSpanFilterProps) {
    return <DateSpanFilter field="auctionDate" {...props} />;
}

export function CreationDateSpanFilter(props: DateSpanFilterProps) {
    return <DateSpanFilter field="creationDate" {...props} />;
}

export function UpdateDateSpanFilter(props: DateSpanFilterProps) {
    return <DateSpanFilter field="updateDate" {...props} />;
}
