import type { FilterSchema } from "@/components/search/SearchFilters.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { Card, CardContent, CardHeader } from "@/components/ui/card.tsx";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/product/badges/StatusBadge.tsx";
import { Controller, useFormContext } from "react-hook-form";
import type { CheckedState } from "@radix-ui/react-checkbox";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";
import { FilterX } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useFilterNavigation } from "@/hooks/search/useFilterNavigation.ts";

const productStates = ["LISTED", "AVAILABLE", "RESERVED", "SOLD", "REMOVED", "UNKNOWN"] as const;

function handleCheckedChange(
    field: { value: string[]; onChange: (value: string[]) => void },
    state: string,
    isChecked: CheckedState,
) {
    if (isChecked) {
        field.onChange([...field.value, state]);
    } else {
        field.onChange(field.value?.filter((value) => value !== state));
    }
}

export function ProductStateFilter() {
    const { control } = useFormContext<FilterSchema>();
    const { t } = useTranslation();
    const resetAndNavigate = useFilterNavigation();

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <H2>{t("search.filter.productState")}</H2>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => resetAndNavigate("productState")}
                            className="h-8 w-8 p-0"
                        >
                            <FilterX className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t("search.filter.resetTooltip.productState")}</p>
                    </TooltipContent>
                </Tooltip>
            </CardHeader>
            <CardContent>
                <div className={"w-full grid grid-cols-1 sm:grid-cols-2 gap-4"}>
                    {productStates.map((state) => (
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
            </CardContent>
        </Card>
    );
}
