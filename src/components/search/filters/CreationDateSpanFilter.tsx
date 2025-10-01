import type { FilterSchema } from "@/components/search/SearchFilters.tsx";
import { H2 } from "@/components/typography/H2";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader } from "@/components/ui/card.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";

export function CreationDateSpanFilter() {
    return (
        <Card>
            <CardHeader>
                <H2>Erstellungsdatum</H2>
            </CardHeader>
            <CardContent>
                <div className={"flex flex-col lg:flex-row gap-2 items-center"}>
                    <DatePicker fieldName="creationDate.from" />
                    <span>-</span>
                    <DatePicker fieldName="creationDate.to" />
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
    const { control } = useFormContext<FilterSchema>();

    return (
        <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
                <Popover>
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
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            locale={de}
                            mode="single"
                            captionLayout={"dropdown"}
                            selected={field.value}
                            onSelect={(date) => field.onChange(date)}
                        />
                    </PopoverContent>
                </Popover>
            )}
        />
    );
}
