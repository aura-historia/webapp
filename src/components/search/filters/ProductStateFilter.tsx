import type { FilterSchema } from "@/components/search/SearchFilters.tsx";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/product/badges/StatusBadge.tsx";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useFilterNavigation } from "@/hooks/search/useFilterNavigation.ts";
import { PRODUCT_STATES } from "@/data/internal/product/ProductState.ts";
import { handleCheckedChange } from "@/lib/utils.ts";
import { FilterCard } from "./FilterCard.tsx";

export function ProductStateFilter() {
    const { control } = useFormContext<FilterSchema>();
    const { t } = useTranslation();
    const resetAndNavigate = useFilterNavigation();

    return (
        <FilterCard
            title={t("search.filter.productState")}
            resetTooltip={t("search.filter.resetTooltip.productState")}
            onReset={() => resetAndNavigate("productState")}
        >
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PRODUCT_STATES.map((state) => (
                    <Controller
                        key={state}
                        name="productState"
                        control={control}
                        render={({ field }) => {
                            const isChecked = field.value?.includes(state);
                            return (
                                <div className="flex flex-row gap-4 items-center">
                                    <Checkbox
                                        id={`checkbox-${state}`}
                                        checked={isChecked}
                                        className="cursor-pointer"
                                        onCheckedChange={(checked) =>
                                            handleCheckedChange(field, state, checked)
                                        }
                                    />
                                    <button
                                        type="button"
                                        className="cursor-pointer select-none border-0 bg-transparent p-0"
                                        onClick={() =>
                                            handleCheckedChange(field, state, !isChecked)
                                        }
                                    >
                                        <StatusBadge
                                            status={state}
                                            className={isChecked ? "" : "opacity-35"}
                                        />
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
