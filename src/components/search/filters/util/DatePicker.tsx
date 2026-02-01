import { Controller, useFormContext } from "react-hook-form";
import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import type { FilterSchema } from "@/components/search/SearchFilters.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.tsx";
import { Button } from "@/components/ui/button";
import { CalendarIcon, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar.tsx";
import { useTranslation } from "react-i18next";

export function DatePicker({
    fieldName,
    disabled = false,
}: {
    readonly fieldName:
        | "creationDate.from"
        | "creationDate.to"
        | "updateDate.from"
        | "updateDate.to"
        | "auctionDate.from"
        | "auctionDate.to";
    readonly disabled?: boolean;
}) {
    const { control, setValue } = useFormContext<FilterSchema>();
    const [calendarOpen, setCalendarOpen] = useState(false);
    const { t } = useTranslation();

    return (
        <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <div className="flex flex-row ">
                        <PopoverTrigger asChild>
                            <Button
                                variant="default"
                                data-empty={!field.value}
                                className="justify-start text-left font-normal bg-background text-foreground hover:bg-background"
                                disabled={disabled}
                            >
                                <CalendarIcon />
                                {field.value ? (
                                    format(field.value, "P", { locale: de })
                                ) : (
                                    <span>{t("search.filter.anyDate")}</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <Button
                            type="button"
                            variant={"ghost"}
                            className="h-8 w-8 p-0 ml-auto"
                            disabled={disabled}
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
