import type { FilterSchema } from "@/components/search/SearchFilters.tsx";
import { H2 } from "@/components/typography/H2";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader } from "@/components/ui/card.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import { useState } from "react";

export function CreationDateSpanFilter() {
    return (
        <Card>
            <CardHeader>
                <H2>Hinzugefügt</H2>
            </CardHeader>
            <CardContent>
                <div className={"flex flex-col w-full gap-2"}>
                    <div className={"flex flex-row gap-2 items-center justify-between"}>
                        <span>Von: </span>
                        <DatePicker fieldName="creationDate.from" />
                    </div>
                    <div className={"flex flex-row gap-2 items-center justify-between"}>
                        <span>Bis: </span>
                        <DatePicker fieldName="creationDate.to" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function DatePicker({
    fieldName,
}: {
    readonly fieldName: "creationDate.from" | "creationDate.to";
}) {
    const { control, setValue } = useFormContext<FilterSchema>();
    const [calendarOpen, setCalendarOpen] = useState(false);

    return (
        <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <div className={"flex flex-row"}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="default"
                                data-empty={!field.value}
                                className="justify-start text-left font-normal bg-background text-foreground hover:bg-background"
                            >
                                <CalendarIcon />
                                {field.value ? (
                                    format(field.value, "P", { locale: de })
                                ) : (
                                    <span>Beliebig</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <Button
                            type="button"
                            variant={"ghost"}
                            onClick={() =>
                                setValue(fieldName, undefined, {
                                    shouldDirty: false,
                                    shouldValidate: false,
                                })
                            }
                        >
                            <X />
                        </Button>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                locale={de}
                                mode="single"
                                captionLayout={"dropdown"}
                                selected={field.value}
                                onSelect={(date) => {
                                    field.onChange(date);
                                    setCalendarOpen(false);
                                }}
                            />
                        </PopoverContent>
                    </div>
                </Popover>
            )}
        />
    );
}
