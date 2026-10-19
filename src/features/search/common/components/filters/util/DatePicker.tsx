import { CalendarIcon, X } from "lucide-react";
import { useState } from "react";
import { type FieldValues, type Path, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Calendar } from "@/components/ui/calendar.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.tsx";
import { FILTER_FOCUS_CLASS } from "@/features/search/common/components/filters/FilterCard.tsx";
import { useDateFilterFormat } from "@/features/search/common/hooks/useFilterFormatters.ts";
import { cn } from "@/lib/utils.ts";

/** Day cells and month/year selects of the filter calendar, in the design-system look. */
const CALENDAR_CLASS_NAMES = {
    dropdown_root:
        "relative rounded-md bg-surface-sunken has-focus:outline-2 has-focus:outline-brass",
    caption_label:
        "flex h-8 items-center gap-1 rounded-md pr-1.5 pl-2 text-meta font-medium [&>svg]:size-3.5 [&>svg]:text-ink-muted",
    weekday: "flex-1 select-none font-mono text-tag text-ink-muted uppercase",
    today: "font-semibold text-oxblood",
    outside: "text-ink-placeholder",
};

/**
 * A date field bound to a react-hook-form field: a calendar button showing the date in the
 * page language, a clear button once set, and a popover calendar.
 */
export function DatePicker<TFormValues extends FieldValues = FieldValues>({
    fieldName,
    label,
    disabled = false,
    invalid = false,
    describedBy,
}: {
    readonly fieldName: Path<TFormValues>;
    /** Accessible name, e.g. "Auction date from". */
    readonly label: string;
    readonly disabled?: boolean;
    readonly invalid?: boolean;
    readonly describedBy?: string;
}) {
    const { watch, setValue } = useFormContext<TFormValues>();
    // Read the current optional value so cleared dates cannot fall back to initial defaults.
    const value = watch(fieldName) as Date | undefined;
    const [calendarOpen, setCalendarOpen] = useState(false);
    const { t } = useTranslation();
    const { dateLocale, formatDate } = useDateFilterFormat();

    const clear = () => {
        setValue(fieldName, undefined as never, { shouldDirty: true, shouldValidate: true });
        setCalendarOpen(false);
    };

    return (
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <div
                className={cn(
                    "flex h-12 min-w-0 items-center gap-1 rounded-md bg-surface-raised pr-1 pl-3 lg:h-10",
                    invalid ? "shadow-[inset_0_0_0_1.5px_var(--oxblood)]" : "shadow-field",
                )}
            >
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        disabled={disabled}
                        aria-label={value ? `${label}: ${formatDate(value)}` : label}
                        aria-invalid={invalid || undefined}
                        aria-describedby={describedBy}
                        className={cn(
                            "flex h-full min-w-0 flex-1 cursor-pointer items-center gap-2 text-left text-body-sm disabled:cursor-not-allowed",
                            value ? "text-ink" : "text-ink-placeholder",
                            FILTER_FOCUS_CLASS,
                        )}
                    >
                        <CalendarIcon
                            aria-hidden="true"
                            strokeWidth={1.8}
                            className={cn(
                                "size-[15px] shrink-0",
                                invalid ? "text-oxblood" : "text-ink-muted",
                            )}
                        />
                        <span className="min-w-0 truncate">
                            {value ? formatDate(value) : t("search.filter.anyDate")}
                        </span>
                    </button>
                </PopoverTrigger>
                {value && !disabled && (
                    <button
                        type="button"
                        aria-label={t("search.filter.clearDateLabel", { label })}
                        onClick={clear}
                        className={cn(
                            "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-pill text-ink-muted hover:text-ink",
                            FILTER_FOCUS_CLASS,
                        )}
                    >
                        <X aria-hidden="true" className="size-3" strokeWidth={2.2} />
                    </button>
                )}
            </div>
            <PopoverContent
                align="start"
                className="flex w-auto flex-col gap-2 rounded-panel border-0 bg-surface-raised p-3 text-ink shadow-menu"
            >
                <Calendar
                    locale={dateLocale}
                    mode="single"
                    captionLayout="dropdown"
                    selected={value}
                    defaultMonth={value}
                    classNames={CALENDAR_CLASS_NAMES}
                    className="bg-transparent p-0 [&_[data-selected-single=true]]:rounded-pill [&_[data-selected-single=true]]:bg-oxblood [&_[data-selected-single=true]]:text-on-oxblood [&_[data-slot=button]]:rounded-pill"
                    onSelect={(date) => {
                        setValue(fieldName, date as never, {
                            shouldDirty: true,
                            shouldValidate: true,
                        });
                        setCalendarOpen(false);
                    }}
                />
                {value && (
                    <button
                        type="button"
                        onClick={clear}
                        className={cn(
                            "min-h-8 cursor-pointer self-start text-meta font-medium underline decoration-line-strong underline-offset-3 hover:text-brass-ink",
                            FILTER_FOCUS_CLASS,
                        )}
                    >
                        {t("search.filter.clearDate")}
                    </button>
                )}
            </PopoverContent>
        </Popover>
    );
}
