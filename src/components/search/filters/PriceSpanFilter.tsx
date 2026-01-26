import type { FilterSchema } from "@/components/search/SearchFilters.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { Card, CardContent, CardHeader } from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Slider } from "@/components/ui/slider.tsx";
import { useEffect, useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";
import { FilterX } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useFilterNavigation } from "@/hooks/search/useFilterNavigation.ts";

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
        // Accept only digits
        if (!/^\d+$/.test(raw)) return;
        const num = Number(raw);
        if (Number.isNaN(num)) return;
        setValue(fieldName, num, { shouldDirty: true, shouldValidate: true });
    };

    function sortInputFields() {
        if (sliderMin > sliderMax && sliderMin && sliderMax) {
            setValue("priceSpan.min", sliderMax, { shouldDirty: true, shouldValidate: true });
            setValue("priceSpan.max", sliderMin, { shouldDirty: true, shouldValidate: true });
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <H2>{t("search.filter.priceSpan")}</H2>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => resetAndNavigate("priceSpan")}
                            className="h-8 w-8 p-0"
                            aria-label={t("search.filter.resetTooltip.priceSpan")}
                        >
                            <FilterX className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t("search.filter.resetTooltip.priceSpan")}</p>
                    </TooltipContent>
                </Tooltip>
            </CardHeader>
            <CardContent>
                <div className={"flex flex-col gap-4"}>
                    <Slider
                        className={"z-0"}
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
                    <div className="flex flex-row gap-2 items-center">
                        <Controller
                            name="priceSpan.min"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    placeholder={t("search.filter.min")}
                                    className="rounded border px-2 py-1 text-sm"
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
                        <span>€</span>
                        <span> -</span>
                        <Controller
                            name="priceSpan.max"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    placeholder={t("search.filter.max")}
                                    className="rounded border px-2 py-1 text-sm"
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
                        <span>€</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
