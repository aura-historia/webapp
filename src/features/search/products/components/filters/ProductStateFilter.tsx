import { Check } from "lucide-react";
import { useId, useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
    LISTING_AVAILABILITIES,
    LISTING_AVAILABILITY_TRANSLATION_KEYS,
    type ListingAvailability,
} from "@/data/internal/product/ListingAvailability.ts";
import {
    FILTER_FOCUS_CLASS,
    FilterCard,
} from "@/features/search/common/components/filters/FilterCard.tsx";
import type { FilterSchema } from "@/features/search/common/lib/filterForm.ts";
import { useFilterNavigation } from "@/features/search/products/hooks/useFilterNavigation.ts";
import { cn, handleCheckedChange } from "@/lib/utils.ts";

type Availability = Exclude<ListingAvailability, "UNKNOWN">;

/** The states most searches care about come first; the rest open with "Show all". */
const PRIMARY_AVAILABILITIES: readonly Availability[] = [
    "AVAILABLE",
    "IN_STOCK",
    "LIMITED_AVAILABILITY",
    "RESERVED",
    "SOLD_OUT",
    "UNAVAILABLE",
];
const ORDERED_AVAILABILITIES: readonly Availability[] = [
    ...PRIMARY_AVAILABILITIES,
    ...LISTING_AVAILABILITIES.filter((value) => !PRIMARY_AVAILABILITIES.includes(value)),
];

export function ProductStateFilter() {
    const { control } = useFormContext<FilterSchema>();
    const { t } = useTranslation();
    const resetAndNavigate = useFilterNavigation();
    const [showAll, setShowAll] = useState(false);
    const listId = useId();
    const selected = useWatch({ control, name: "availability" }) ?? [];
    const total = LISTING_AVAILABILITIES.length;
    const allSelected = selected.length === total;
    const visible = showAll ? ORDERED_AVAILABILITIES : PRIMARY_AVAILABILITIES;

    return (
        <FilterCard
            title={t("search.filter.availability")}
            summary={
                allSelected
                    ? t("search.filter.allSelected")
                    : t("search.filter.selectedOf", { selected: selected.length, total })
            }
            resetTooltip={t("search.filter.resetTooltip.availability")}
            onReset={() => resetAndNavigate("availability")}
            active={!allSelected}
        >
            <div id={listId} className="flex flex-col">
                {visible.map((availability) => (
                    <Controller
                        key={availability}
                        name="availability"
                        control={control}
                        render={({ field }) => {
                            const isChecked = field.value?.includes(availability) ?? false;
                            const isLastSelected = field.value?.length === 1 && isChecked;
                            return (
                                <label
                                    className={cn(
                                        "flex min-h-11 cursor-pointer items-center gap-2.5 text-body-sm leading-snug lg:min-h-9",
                                        isChecked ? "text-ink" : "text-ink-muted",
                                    )}
                                >
                                    <input
                                        type="checkbox"
                                        className="peer sr-only"
                                        checked={isChecked}
                                        aria-disabled={isLastSelected || undefined}
                                        onChange={(event) => {
                                            if (isLastSelected) return;
                                            handleCheckedChange(
                                                field,
                                                availability,
                                                event.target.checked,
                                            );
                                        }}
                                    />
                                    <span
                                        aria-hidden="true"
                                        className={cn(
                                            "inline-flex size-3.5 shrink-0 items-center justify-center rounded-[3px] text-on-oxblood peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-brass",
                                            isChecked
                                                ? "bg-oxblood"
                                                : "shadow-[inset_0_0_0_1px_var(--line-strong)]",
                                        )}
                                    >
                                        {isChecked && (
                                            <Check className="size-2.5" strokeWidth={3.2} />
                                        )}
                                    </span>
                                    {t(LISTING_AVAILABILITY_TRANSLATION_KEYS[availability])}
                                </label>
                            );
                        }}
                    />
                ))}
                <button
                    type="button"
                    aria-controls={listId}
                    aria-expanded={showAll}
                    onClick={() => setShowAll((value) => !value)}
                    className={cn(
                        "min-h-9 cursor-pointer self-start text-meta font-medium text-ink underline decoration-line-strong underline-offset-3 hover:text-brass-ink",
                        FILTER_FOCUS_CLASS,
                    )}
                >
                    {showAll
                        ? t("search.filter.showFewer")
                        : t("search.filter.showAll", { count: total })}
                </button>
            </div>
        </FilterCard>
    );
}
