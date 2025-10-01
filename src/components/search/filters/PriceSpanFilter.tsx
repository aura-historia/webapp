import type { FilterSchema } from "@/components/search/SearchFilters.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { Card, CardContent, CardHeader } from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Slider } from "@/components/ui/slider.tsx";
import { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";

const PRICE_MIN = 0;
const PRICE_MAX = 10_000;

export function PriceSpanFilter() {
    const { control, watch, setValue } = useFormContext<FilterSchema>();

    const watchedMin = watch("priceSpan.min");
    const watchedMax = watch("priceSpan.max");

    const sliderMin = typeof watchedMin === "number" ? watchedMin : PRICE_MIN;
    const sliderMax = typeof watchedMax === "number" ? watchedMax : PRICE_MAX;

    useEffect(() => {
        if (sliderMin > sliderMax) {
            setValue("priceSpan.min", sliderMax, { shouldDirty: true, shouldValidate: true });
            setValue("priceSpan.max", sliderMin, { shouldDirty: true, shouldValidate: true });
        }
    }, [sliderMin, sliderMax, setValue]);

    return (
        <Card>
            <CardHeader>
                <H2>Preisspanne</H2>
            </CardHeader>
            <CardContent>
                <div className={"flex flex-col gap-4"}>
                    <Slider
                        value={[sliderMin, sliderMax]}
                        min={PRICE_MIN}
                        max={PRICE_MAX}
                        step={10}
                        onValueChange={([min, max]) => {
                            setValue("priceSpan.min", min, {
                                shouldDirty: true,
                                shouldValidate: true,
                            });
                            setValue("priceSpan.max", max, {
                                shouldDirty: true,
                                shouldValidate: true,
                            });
                        }}
                        aria-label="Preisspanne"
                    />
                    <div className="flex flex-row gap-2 items-center">
                        <Controller
                            name="priceSpan.min"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="number"
                                    placeholder="Min"
                                    className="rounded border px-2 py-1 text-sm"
                                    value={field.value ?? ""}
                                    onChange={(e) =>
                                        field.onChange(
                                            e.target.value === ""
                                                ? undefined
                                                : Number(e.target.value),
                                        )
                                    }
                                    min={PRICE_MIN}
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
                                    type="number"
                                    placeholder="Max"
                                    className="rounded border px-2 py-1 text-sm"
                                    value={field.value ?? ""}
                                    onChange={(e) =>
                                        field.onChange(
                                            e.target.value === ""
                                                ? undefined
                                                : Number(e.target.value),
                                        )
                                    }
                                    min={PRICE_MIN}
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
