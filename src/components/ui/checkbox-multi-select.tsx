import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export type CheckboxMultiSelectOption = {
    value: string;
    label: string;
};

export type CheckboxMultiSelectProps = {
    readonly options: CheckboxMultiSelectOption[];
    readonly value: string[];
    readonly onChange: (value: string[]) => void;
    readonly placeholder?: string;
    readonly allSelectedLabel?: string;
};

export function CheckboxMultiSelect({
    options,
    value,
    onChange,
    placeholder = "Select...",
    allSelectedLabel = "All",
}: CheckboxMultiSelectProps) {
    const [open, setOpen] = React.useState(false);
    const [visibleCount, setVisibleCount] = React.useState(1);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const measureRef = React.useRef<HTMLDivElement>(null);

    const selectedOptions = React.useMemo(
        () => options.filter((opt) => value.includes(opt.value)),
        [options, value],
    );
    const allSelected = value.length === options.length && options.length > 0;
    const noneSelected = value.length === 0;

    const handleToggle = (optionValue: string) => {
        onChange(
            value.includes(optionValue)
                ? value.filter((v) => v !== optionValue)
                : [...value, optionValue],
        );
    };

    const handleToggleAll = () => {
        onChange(allSelected ? [] : options.map((opt) => opt.value));
    };

    React.useLayoutEffect(() => {
        const container = containerRef.current;
        const measure = measureRef.current;
        if (noneSelected || allSelected || !container || !measure) return;

        const calculate = () => {
            const styles = window.getComputedStyle(container);
            const availableWidth =
                container.offsetWidth -
                parseFloat(styles.paddingLeft) -
                parseFloat(styles.paddingRight) -
                48; // chevron + reset icon + buffer

            const labels = selectedOptions.map((opt) => opt.label);
            let count = 0;

            for (let i = 1; i <= labels.length; i++) {
                const remaining = labels.length - i;
                measure.textContent = labels.slice(0, i).join(", ");
                let width = measure.offsetWidth;

                if (remaining > 0) {
                    measure.textContent = `+${remaining}`;
                    width += 4 + measure.offsetWidth;
                }

                if (width <= availableWidth) count = i;
                else break;
            }

            setVisibleCount(Math.max(1, count));
        };

        calculate();
        const observer = new ResizeObserver(calculate);
        observer.observe(container);
        return () => observer.disconnect();
    }, [selectedOptions, noneSelected, allSelected]);

    const remainingCount = selectedOptions.length - visibleCount;

    const displayContent = noneSelected ? (
        <span className="text-muted-foreground">{placeholder}</span>
    ) : allSelected ? (
        <span>{allSelectedLabel}</span>
    ) : (
        <span className="flex items-center gap-1 min-w-0">
            <span className="truncate">
                {selectedOptions
                    .slice(0, visibleCount)
                    .map((opt) => opt.label)
                    .join(", ")}
            </span>
            {remainingCount > 0 && (
                <span className="shrink-0 text-muted-foreground">+{remainingCount}</span>
            )}
        </span>
    );

    return (
        <div>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <div
                        ref={containerRef}
                        role="combobox"
                        aria-expanded={open}
                        tabIndex={0}
                        className="relative flex h-9 w-full cursor-pointer items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs"
                    >
                        <div
                            ref={measureRef}
                            className="pointer-events-none invisible absolute whitespace-nowrap"
                            aria-hidden="true"
                        />
                        {displayContent}
                        <div className="flex items-center gap-1 shrink-0">
                            {!noneSelected && !allSelected && (
                                <X
                                    className="h-4 w-4 opacity-50 hover:opacity-100"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onChange(options.map((opt) => opt.value));
                                    }}
                                />
                            )}
                            <ChevronDown className="h-4 w-4 opacity-50" />
                        </div>
                    </div>
                </PopoverTrigger>
                <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0"
                    align="start"
                >
                    <div className="max-h-60 overflow-auto p-1">
                        <div
                            className={cn(
                                "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                allSelected && "bg-accent/50",
                            )}
                            onClick={handleToggleAll}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    handleToggleAll();
                                }
                            }}
                            tabIndex={0}
                            role="option"
                            aria-selected={allSelected}
                        >
                            <div
                                className={cn(
                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                    allSelected
                                        ? "bg-primary text-primary-foreground"
                                        : "opacity-50",
                                )}
                            >
                                {allSelected && <Check className="h-3 w-3" />}
                            </div>
                            <span>{allSelectedLabel}</span>
                        </div>
                        <Separator className="my-1" />
                        {options.map((option) => {
                            const isSelected = value.includes(option.value);
                            return (
                                <div
                                    key={option.value}
                                    className={cn(
                                        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                        isSelected && "bg-accent/50",
                                    )}
                                    onClick={() => handleToggle(option.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            handleToggle(option.value);
                                        }
                                    }}
                                    tabIndex={0}
                                    role="option"
                                    aria-selected={isSelected}
                                >
                                    <div
                                        className={cn(
                                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                            isSelected
                                                ? "bg-primary text-primary-foreground"
                                                : "opacity-50",
                                        )}
                                    >
                                        {isSelected && <Check className="h-3 w-3" />}
                                    </div>
                                    <span>{option.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
