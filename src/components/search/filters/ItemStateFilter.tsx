import type { FilterSchema } from "@/components/search/SearchFilters.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { Card, CardContent, CardHeader } from "@/components/ui/card.tsx";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/item/StatusBadge.tsx";
import { Controller, useFormContext } from "react-hook-form";
import type { CheckedState } from "@radix-ui/react-checkbox";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";
import { FilterX } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useFilterNavigation } from "@/hooks/useFilterNavigation";

const itemStates = ["LISTED", "AVAILABLE", "RESERVED", "SOLD", "REMOVED", "UNKNOWN"] as const;

function handleCheckedChange(
    field: { value: string[]; onChange: (value: string[]) => void },
    item: string,
    isChecked: CheckedState,
) {
    if (isChecked) {
        field.onChange([...field.value, item]);
    } else {
        field.onChange(field.value?.filter((value) => value !== item));
    }
}

export function ItemStateFilter() {
    const { control } = useFormContext<FilterSchema>();
    const { t } = useTranslation();
    const resetAndNavigate = useFilterNavigation();

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <H2>{t("search.filter.itemState")}</H2>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => resetAndNavigate("itemState")}
                            className="h-8 w-8 p-0"
                        >
                            <FilterX className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t("search.filter.resetTooltip.itemState")}</p>
                    </TooltipContent>
                </Tooltip>
            </CardHeader>
            <CardContent>
                <div className={"w-full grid grid-cols-2 gap-4"}>
                    {itemStates.map((item) => (
                        <Controller
                            key={item}
                            name="itemState"
                            control={control}
                            render={({ field }) => (
                                <div className="flex flex-row gap-4 items-center">
                                    <Checkbox
                                        id={`checkbox-${item}`}
                                        checked={field.value?.includes(item)}
                                        className="cursor-pointer"
                                        onCheckedChange={(checked) =>
                                            handleCheckedChange(field, item, checked)
                                        }
                                    />
                                    <label
                                        htmlFor={`checkbox-${item}`}
                                        className="cursor-pointer select-none"
                                    >
                                        <StatusBadge
                                            status={item}
                                            className={
                                                field.value?.includes(item) ? "" : "opacity-35"
                                            }
                                        />
                                    </label>
                                </div>
                            )}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
