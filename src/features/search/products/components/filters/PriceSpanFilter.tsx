import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { Currency } from "@/data/internal/common/Currency.ts";
import { CURRENCY_SYMBOLS } from "@/data/internal/common/Currency.ts";
import { FilterCard } from "@/features/search/common/components/filters/FilterCard.tsx";
import { usePriceFilterFormat } from "@/features/search/common/hooks/useFilterFormatters.ts";
import type { FilterSchema } from "@/features/search/common/lib/filterForm.ts";
import { useUserPreferences } from "@/features/preferences/hooks/useUserPreferences.tsx";
import { useFilterNavigation } from "@/features/search/products/hooks/useFilterNavigation.ts";

type PriceField = "priceSpan.min" | "priceSpan.max";

export function PriceSpanFilter({ currency }: { readonly currency?: Currency } = {}) {
    const { watch, setValue } = useFormContext<FilterSchema>();
    const { t } = useTranslation();
    const { preferences } = useUserPreferences();
    const { formatPriceRange } = usePriceFilterFormat(currency);
    const resetAndNavigate = useFilterNavigation();

    // Read optional values directly: Controller can fall back to its initial value after reset.
    const min = watch("priceSpan.min");
    const max = watch("priceSpan.max");
    const isActive = typeof min === "number" || typeof max === "number";
    const currencySymbol = CURRENCY_SYMBOLS[currency ?? preferences.currency];

    const handleNumericChange = (raw: string, fieldName: PriceField) => {
        if (raw === "") {
            setValue(fieldName, undefined, { shouldDirty: true, shouldValidate: true });
            return;
        }
        if (!/^\d+$/.test(raw)) return;
        setValue(fieldName, Number(raw), { shouldDirty: true, shouldValidate: true });
    };

    /** A minimum above the maximum swaps the two once the field is left. */
    const sortInputFields = () => {
        if (typeof min === "number" && typeof max === "number" && min > max) {
            setValue("priceSpan.min", max, { shouldDirty: true, shouldValidate: true });
            setValue("priceSpan.max", min, { shouldDirty: true, shouldValidate: true });
        }
    };

    const renderField = (
        fieldName: PriceField,
        value: number | undefined,
        label: string,
        aria: string,
    ) => (
        <label className="flex min-w-0 flex-col gap-1.5">
            <span className="font-mono text-tag tracking-[0.14em] text-ink-muted uppercase">
                {label}
            </span>
            <span className="flex h-12 items-center gap-1.5 rounded-md bg-surface-raised px-3 shadow-field focus-within:outline-2 focus-within:outline-offset-3 focus-within:outline-brass lg:h-10">
                <span aria-hidden="true" className="text-body-sm text-ink-muted">
                    {currencySymbol}
                </span>
                <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    aria-label={aria}
                    placeholder={label}
                    value={value === undefined || value === null ? "" : String(value)}
                    onChange={(event) => handleNumericChange(event.target.value, fieldName)}
                    onBlur={sortInputFields}
                    className="min-w-0 flex-1 bg-transparent text-base text-ink tabular-nums outline-none placeholder:text-ink-placeholder lg:text-sm"
                />
            </span>
        </label>
    );

    return (
        <FilterCard
            title={t("search.filter.priceRange")}
            summary={isActive ? formatPriceRange(min, max) : undefined}
            resetTooltip={t("search.filter.resetTooltip.priceSpan")}
            onReset={() => resetAndNavigate("priceSpan")}
            active={isActive}
        >
            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-2 pt-1">
                {renderField(
                    "priceSpan.min",
                    min,
                    t("search.filter.min"),
                    t("search.filter.minPrice"),
                )}
                <span
                    aria-hidden="true"
                    className="inline-flex h-12 items-center text-ink-muted lg:h-10"
                >
                    –
                </span>
                {renderField(
                    "priceSpan.max",
                    max,
                    t("search.filter.max"),
                    t("search.filter.maxPrice"),
                )}
            </div>
        </FilterCard>
    );
}
