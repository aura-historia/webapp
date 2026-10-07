import { useFormContext, type FieldValues, type Path } from "react-hook-form";
import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.tsx";
import { Button } from "@/components/ui/button";
import { CalendarIcon, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar.tsx";
import { useTranslation } from "react-i18next";

/**
 * A reusable date picker control bound to a react-hook-form field.
 * Works with any form schema (e.g. product search filters, shop search filters).
 */
export function DatePicker<TFormValues extends FieldValues = FieldValues>({
    fieldName,
    disabled = false,
}: {
    readonly fieldName: Path<TFormValues>;
    readonly disabled?: boolean;
}) {
    const { watch, setValue } = useFormContext<TFormValues>();
    // Read the current optional value so cleared dates cannot fall back to initial defaults.
    const value = watch(fieldName);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const { t } = useTranslation();

    return (
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <div className="flex min-w-0 w-full items-center gap-2">
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        data-empty={!value}
                        className="h-9 min-w-0 flex-1 shrink justify-start overflow-hidden rounded-none border-0 border-b border-outline-variant bg-transparent px-0 text-left font-normal text-foreground shadow-none hover:bg-transparent"
                        disabled={disabled}
                    >
                        <CalendarIcon />
                        {value ? (
                            <span className="min-w-0 truncate">
                                {format(value, "P", { locale: de })}
                            </span>
                        ) : (
                            <span className="min-w-0 truncate">{t("search.filter.anyDate")}</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <Button
                    type="button"
                    variant={"ghost"}
                    className="ml-auto h-7 w-7 shrink-0 p-0 text-primary/70 hover:bg-primary/8 hover:text-primary"
                    disabled={disabled}
                    onClick={() =>
                        setValue(fieldName, undefined as never, {
                            shouldDirty: false,
                            shouldValidate: false,
                        })
                    }
                >
                    <X className="size-3.5" />
                </Button>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        locale={de}
                        mode="single"
                        captionLayout={"dropdown"}
                        selected={value}
                        onSelect={(date) => {
                            setValue(fieldName, date as never, {
                                shouldDirty: true,
                                shouldValidate: true,
                            });
                            setCalendarOpen(false);
                        }}
                    />
                </PopoverContent>
            </div>
        </Popover>
    );
}
