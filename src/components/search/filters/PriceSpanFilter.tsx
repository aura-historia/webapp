import type { FilterSchema } from "@/components/search/SearchFilters.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Slider } from "@/components/ui/slider.tsx";
import { useEffect, useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useFilterNavigation } from "@/hooks/search/useFilterNavigation.ts";
import { FilterCard } from "./FilterCard.tsx";

const PRICE_MIN = 0;
const PRICE_MAX = 10_000;

export function PriceSpanFilter() {
    const { control, watch, setValue } = useFormContext<FilterSchema>();
    const { t } = useTranslation();
    const resetAndNavigate = useFilterNavigation();

    const watchedMin = watch("priceSpan.min");
    const watchedMax = watch("priceSpan.max");
    const watchedPriceSpan = watch("priceSpan");

    const sliderMin = typeof watchedMin === "number" ? watchedMin : PRICE_MIN;
    const sliderMax = typeof watchedMax === "number" ? watchedMax : PRICE_MAX;

    // Prevent unnecessary form writes when slider values haven't logically changed
    const lastSlider = useRef<[number, number]>([sliderMin, sliderMax]);

    useEffect(() => {
        if (!watchedPriceSpan) {
            lastSlider.current = [PRICE_MIN, PRICE_MAX];
        }

        lastSlider.current = [sliderMin, sliderMax];
    }, [sliderMin, sliderMax, watchedPriceSpan]);

    const handleNumericChange = (raw: string, fieldName: "priceSpan.min" | "priceSpan.max") => {
        if (raw === "") {
            setValue(fieldName, undefined, { shouldDirty: true, shouldValidate: true });
            return;
        }
        if (!/^\d+$/.test(raw)) return;
        const num = Number(raw);
        if (Number.isNaN(num)) return;
        setValue(fieldName, num, { shouldDirty: true, shouldValidate: true });
    };

    function sortInputFields() {
        if (
            typeof watchedMin === "number" &&
            typeof watchedMax === "number" &&
            watchedMin > watchedMax
        ) {
            setValue("priceSpan.min", watchedMax, { shouldDirty: true, shouldValidate: true });
            setValue("priceSpan.max", watchedMin, { shouldDirty: true, shouldValidate: true });
        }
    }

    return (
        <FilterCard
            title={t("search.filter.priceSpan")}
            resetTooltip={t("search.filter.resetTooltip.priceSpan")}
            onReset={() => resetAndNavigate("priceSpan")}
        >
            <div className="mt-2 flex flex-col gap-4">
                <Slider
                    className="z-0 px-1"
                    value={[sliderMin, sliderMax]}
                    min={PRICE_MIN}
                    max={PRICE_MAX}
                    step={10}
                    onValueChange={([min, max]) => {
                        const [prevMin, prevMax] = lastSlider.current;
                        if (prevMin !== min) {
                            setValue("priceSpan.min", min, {
                                shouldDirty: true,
                                shouldValidate: true,
                            });
                        }
                        if (prevMax !== max) {
                            setValue("priceSpan.max", max, {
                                shouldDirty: true,
                                shouldValidate: true,
                            });
                        }
                    }}
                    aria-label={t("search.filter.priceSpanAria")}
                />
                <div className="flex items-center gap-2">
                    <Controller
                        name="priceSpan.min"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder={t("search.filter.min")}
                                className="h-9 rounded-none border-0 border-b border-outline-variant bg-transparent px-0 py-0 text-sm shadow-none focus-visible:border-primary focus-visible:ring-0"
                                value={
                                    field.value === undefined || field.value === null
                                        ? ""
                                        : String(field.value)
                                }
                                onChange={(e) =>
                                    handleNumericChange(e.target.value, "priceSpan.min")
                                }
                                onBlur={() => {
                                    sortInputFields();
                                }}
                            />
                        )}
                    />
                    <span className="text-xs uppercase text-on-surface-variant">€</span>
                    <span className="text-on-surface-variant">-</span>
                    <Controller
                        name="priceSpan.max"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder={t("search.filter.max")}
                                className="h-9 rounded-none border-0 border-b border-outline-variant bg-transparent px-0 py-0 text-sm shadow-none focus-visible:border-primary focus-visible:ring-0"
                                value={
                                    field.value === undefined || field.value === null
                                        ? ""
                                        : String(field.value)
                                }
                                onChange={(e) =>
                                    handleNumericChange(e.target.value, "priceSpan.max")
                                }
                                onBlur={() => {
                                    sortInputFields();
                                }}
                            />
                        )}
                    />
                    <span className="text-xs uppercase text-on-surface-variant">€</span>
                </div>
            </div>
        </FilterCard>
    );
}
