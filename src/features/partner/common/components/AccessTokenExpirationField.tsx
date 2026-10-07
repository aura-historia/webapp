import { format, parseISO } from "date-fns";
import { de, enGB, es, fr, it } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { useState } from "react";
import { type Control, useController } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";
import { Calendar } from "@/components/ui/calendar.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import type { AccessTokenCreateFormData } from "./AccessTokenCreateForm.ts";

const CALENDAR_LOCALES = { de, en: enGB, es, fr, it };
const TIME_UNITS = [
    {
        label: "expirationHour",
        values: Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0")),
    },
    {
        label: "expirationMinute",
        values: Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0")),
    },
] as const;

export function AccessTokenExpirationField({
    id,
    control,
    disabled = false,
}: {
    readonly id: string;
    readonly control: Control<AccessTokenCreateFormData>;
    readonly disabled?: boolean;
}) {
    const { t, i18n } = useTranslation();
    const { field, fieldState } = useController({ control, name: "expiresAt" });
    const [open, setOpen] = useState(false);
    const locale = CALENDAR_LOCALES[i18n.language as keyof typeof CALENDAR_LOCALES] ?? enGB;
    const [dateValue, timeValue = ""] = field.value.split("T");
    const [hour = "00", minute = "00"] = timeValue.split(":");
    const selectedDate = dateValue ? parseISO(dateValue) : undefined;
    const hintId = `${id}-hint`;
    const errorId = `${id}-error`;
    const describedBy = fieldState.error ? `${hintId} ${errorId}` : hintId;

    return (
        <div className="grid gap-2">
            <div className="flex flex-wrap items-end gap-2">
                <div className="grid min-w-40 flex-1 gap-2">
                    <Label htmlFor={id}>{t("partnerAccessTokens.create.fields.expiration")}</Label>
                    <Popover
                        open={open}
                        onOpenChange={(nextOpen) => {
                            setOpen(nextOpen);
                            if (!nextOpen) field.onBlur();
                        }}
                    >
                        <PopoverTrigger asChild>
                            <Button
                                id={id}
                                ref={field.ref}
                                type="button"
                                variant="outline"
                                disabled={disabled}
                                aria-invalid={Boolean(fieldState.error)}
                                aria-describedby={describedBy}
                                onBlur={field.onBlur}
                                className="h-9 w-full justify-start rounded-md border-input bg-background text-left font-normal text-foreground dark:bg-input/30"
                            >
                                <CalendarIcon className="size-4 shrink-0" aria-hidden="true" />
                                <span
                                    className={
                                        selectedDate ? "truncate" : "truncate text-muted-foreground"
                                    }
                                >
                                    {selectedDate
                                        ? format(selectedDate, "P", { locale })
                                        : t(
                                              "partnerAccessTokens.create.fields.chooseExpirationDate",
                                          )}
                                </span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-auto p-0">
                            <Calendar
                                mode="single"
                                required
                                locale={locale}
                                selected={selectedDate}
                                defaultMonth={selectedDate}
                                labels={{
                                    labelNext: () =>
                                        t("partnerAccessTokens.create.fields.nextMonth"),
                                    labelPrevious: () =>
                                        t("partnerAccessTokens.create.fields.previousMonth"),
                                    labelDayButton: (date) => format(date, "PPPP", { locale }),
                                }}
                                onSelect={(date) => {
                                    field.onChange(
                                        `${format(date, "yyyy-MM-dd")}T${timeValue || "00:00"}`,
                                    );
                                    field.onBlur();
                                    setOpen(false);
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <div
                    role="group"
                    aria-label={t("partnerAccessTokens.create.fields.expirationTime")}
                    className="flex shrink-0 items-center gap-1"
                >
                    {TIME_UNITS.map((unit, index) => (
                        <div key={unit.label} className="grid gap-2">
                            <Label htmlFor={`${id}-${unit.label}`}>
                                {t(`partnerAccessTokens.create.fields.${unit.label}`)}
                            </Label>
                            <Select
                                disabled={disabled || !dateValue}
                                value={dateValue ? (index === 0 ? hour : minute) : ""}
                                onValueChange={(value) => {
                                    field.onChange(
                                        `${dateValue}T${index === 0 ? value : hour}:${index === 1 ? value : minute}`,
                                    );
                                    field.onBlur();
                                }}
                            >
                                <SelectTrigger
                                    id={`${id}-${unit.label}`}
                                    aria-label={t(
                                        `partnerAccessTokens.create.fields.${unit.label}`,
                                    )}
                                    aria-describedby={describedBy}
                                    aria-invalid={Boolean(fieldState.error)}
                                    className="w-18 bg-background tabular-nums"
                                    onBlur={field.onBlur}
                                >
                                    <SelectValue placeholder="--" />
                                </SelectTrigger>
                                <SelectContent className="max-h-60 min-w-0">
                                    {unit.values.map((value) => (
                                        <SelectItem key={value} value={value}>
                                            {value}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ))}
                </div>
                {field.value && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={disabled}
                        aria-label={t("partnerAccessTokens.create.fields.clearExpiration")}
                        onClick={() => {
                            field.onChange("");
                            field.onBlur();
                        }}
                    >
                        <X className="size-4" aria-hidden="true" />
                    </Button>
                )}
            </div>
            <p id={hintId} className="text-sm text-muted-foreground">
                {t("partnerAccessTokens.create.fields.expirationHint")}
            </p>
            {fieldState.error && (
                <p id={errorId} className="text-sm text-destructive">
                    {fieldState.error.message}
                </p>
            )}
        </div>
    );
}
