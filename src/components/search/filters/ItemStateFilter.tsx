import type { FilterSchema } from "@/components/search/SearchFilters.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { Card, CardContent, CardHeader } from "@/components/ui/card.tsx";
import { Checkbox } from "@/components/ui/checkbox";

import { StatusBadge } from "@/components/item/StatusBadge.tsx";
import { Controller, useFormContext } from "react-hook-form";

const itemStates = ["LISTED", "AVAILABLE", "RESERVED", "SOLD", "REMOVED", "UNKNOWN"] as const;

export function ItemStateFilter() {
    const { control } = useFormContext<FilterSchema>();

    return (
        <Card>
            <CardHeader>
                <H2 className={"hyphens-auto"}>An&shy;zei&shy;gen&shy;sta&shy;tus</H2>
            </CardHeader>
            <CardContent>
                <div className={"w-full grid grid-cols-1 lg:grid-cols-2 gap-4"}>
                    {itemStates.map((item) => (
                        <Controller
                            key={item}
                            name="itemState"
                            control={control}
                            render={({ field }) => (
                                <div className={"flex flex-row gap-4 items-center"}>
                                    <Checkbox
                                        checked={field.value?.includes(item)}
                                        onCheckedChange={(isChecked) => {
                                            isChecked
                                                ? field.onChange([...field.value, item])
                                                : field.onChange(
                                                      field.value?.filter(
                                                          (value) => value !== item,
                                                      ),
                                                  );
                                        }}
                                    />
                                    {field.value?.includes(item) ? (
                                        <StatusBadge status={item} />
                                    ) : (
                                        <StatusBadge className={"opacity-35"} status={item} />
                                    )}
                                </div>
                            )}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
