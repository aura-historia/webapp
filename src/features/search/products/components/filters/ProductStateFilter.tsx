import type { FilterSchema } from "@/features/search/common/lib/filterForm.ts";
import { Checkbox } from "@/components/ui/checkbox";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useFilterNavigation } from "@/features/search/products/hooks/useFilterNavigation.ts";
import {
    LISTING_AVAILABILITIES,
    LISTING_AVAILABILITY_TRANSLATION_KEYS,
} from "@/data/internal/product/ListingAvailability.ts";
import { handleCheckedChange } from "@/lib/utils.ts";
import { FilterCard } from "@/features/search/common/components/filters/FilterCard.tsx";

export function ProductStateFilter() {
    const { control } = useFormContext<FilterSchema>();
    const { t } = useTranslation();
    const resetAndNavigate = useFilterNavigation();

    return (
        <FilterCard
            title={t("search.filter.availability")}
            resetTooltip={t("search.filter.resetTooltip.availability")}
            onReset={() => resetAndNavigate("availability")}
        >
            <div className="grid w-full grid-cols-1 gap-1">
                {LISTING_AVAILABILITIES.map((availability) => (
                    <Controller
                        key={availability}
                        name="availability"
                        control={control}
                        render={({ field }) => {
                            const isChecked = field.value?.includes(availability);
                            const isLastSelected = field.value?.length === 1 && isChecked;
                            return (
                                <div className="flex items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-surface-container-low">
                                    <Checkbox
                                        id={`checkbox-${availability}`}
                                        checked={isChecked}
                                        disabled={isLastSelected}
                                        className="size-[1.1rem] cursor-pointer rounded-none border-outline-variant/70 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                                        onCheckedChange={(checked) =>
                                            handleCheckedChange(field, availability, checked)
                                        }
                                    />
                                    <button
                                        type="button"
                                        className="cursor-pointer select-none border-0 bg-transparent p-0"
                                        onClick={() => {
                                            if (isLastSelected) return;
                                            handleCheckedChange(field, availability, !isChecked);
                                        }}
                                    >
                                        <span className={isChecked ? "" : "opacity-45"}>
                                            {t(LISTING_AVAILABILITY_TRANSLATION_KEYS[availability])}
                                        </span>
                                    </button>
                                </div>
                            );
                        }}
                    />
                ))}
            </div>
        </FilterCard>
    );
}
