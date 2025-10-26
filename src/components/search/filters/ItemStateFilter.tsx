import type { FilterSchema } from "@/components/search/SearchFilters.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { Card, CardContent, CardHeader } from "@/components/ui/card.tsx";
import { Checkbox } from "@/components/ui/checkbox";

import { StatusBadge } from "@/components/item/StatusBadge.tsx";
import { Controller, useFormContext } from "react-hook-form";
import type { CheckedState } from "@radix-ui/react-checkbox";
import { useTranslation } from "react-i18next";

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

    return (
        <Card>
            <CardHeader>
                <H2>{t("search.filter.itemState")}</H2>
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
