import * as React from "react";
import { Check, ChevronDown, Info, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type CheckboxMultiSelectOption = {
    value: string;
    label: string;
    description?: string;
};

export type CheckboxMultiSelectProps = {
    readonly options: CheckboxMultiSelectOption[];
    readonly value: string[];
    readonly onChange: (value: string[]) => void;
    readonly placeholder?: string;
    readonly allSelectedLabel?: string;
    readonly searchable?: boolean;
    readonly searchPlaceholder?: string;
    readonly infoButtonLabel?: string;
};

export function CheckboxMultiSelect({
    options,
    value,
    onChange,
    placeholder = "Select...",
    allSelectedLabel = "All",
    searchable = false,
    searchPlaceholder = "Search...",
    infoButtonLabel = "More information",
}: CheckboxMultiSelectProps) {
    const [open, setOpen] = React.useState(false);
    const [visibleCount, setVisibleCount] = React.useState(1);
    const [search, setSearch] = React.useState("");
    const containerRef = React.useRef<HTMLDivElement>(null);
    const measureRef = React.useRef<HTMLDivElement>(null);
    const searchInputRef = React.useRef<HTMLInputElement>(null);

    // Buffer changes while the popover is open, apply on close.
    const [pendingValue, setPendingValue] = React.useState(value);

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            onChange(pendingValue);
            setSearch("");
        } else {
            setPendingValue(value);
        }
        setOpen(isOpen);
    };

    const displayValue = open ? pendingValue : value;

    const selectedOptions = React.useMemo(
        () => options.filter((opt) => displayValue.includes(opt.value)),
        [options, displayValue],
    );
    const allSelected = displayValue.length === options.length && options.length > 0;
    const noneSelected = displayValue.length === 0;

    const filteredOptions = React.useMemo(() => {
        if (!search) return options;
        const lowerSearch = search.toLowerCase();
        return options.filter((opt) => opt.label.toLowerCase().includes(lowerSearch));
    }, [options, search]);

    const handleToggle = (optionValue: string) => {
        setPendingValue((prev) =>
            prev.includes(optionValue)
                ? prev.filter((v) => v !== optionValue)
                : [...prev, optionValue],
        );
    };

    const handleToggleAll = () => {
        setPendingValue(allSelected ? [] : options.map((opt) => opt.value));
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
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <div
                    ref={containerRef}
                    role="combobox"
                    aria-expanded={open}
                    tabIndex={0}
                    className="relative flex h-9 w-full cursor-pointer items-center justify-between rounded-none border-0 border-b border-outline-variant bg-transparent px-0 py-2 text-sm shadow-none transition-colors duration-300 ease-out"
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
                                    const allValues = options.map((opt) => opt.value);
                                    if (open) {
                                        setPendingValue(allValues);
                                    } else {
                                        onChange(allValues);
                                    }
                                }}
                            />
                        )}
                        <ChevronDown className="h-4 w-4 opacity-60" />
                    </div>
                </div>
            </PopoverTrigger>
            <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-0"
                align="start"
                onOpenAutoFocus={(e) => {
                    if (searchable) {
                        e.preventDefault();
                        searchInputRef.current?.focus();
                    }
                }}
            >
                {searchable && (
                    <div className="p-1 pb-0">
                        <input
                            ref={searchInputRef}
                            type="text"
                            className="flex h-8 w-full rounded-sm border border-input bg-background px-2 py-1 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                            placeholder={searchPlaceholder}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                )}
                <div className="max-h-60 overflow-auto p-1">
                    {!search && (
                        <>
                            <div
                                className={cn(
                                    "relative flex cursor-pointer select-none items-center rounded-none px-2 py-1.5 text-sm outline-none transition-colors duration-300 ease-out hover:bg-accent hover:text-accent-foreground",
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
                                        "mr-2 flex h-4 w-4 items-center justify-center rounded-none border border-outline-variant",
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
                        </>
                    )}
                    {filteredOptions.map((option) => {
                        const isSelected = displayValue.includes(option.value);
                        return (
                            <div
                                key={option.value}
                                className={cn(
                                    "relative flex cursor-pointer select-none items-center rounded-none px-2 py-1.5 text-sm outline-none transition-colors duration-300 ease-out hover:bg-accent hover:text-accent-foreground",
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
                                        "mr-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-none border border-outline-variant",
                                        isSelected
                                            ? "bg-primary text-primary-foreground"
                                            : "opacity-50",
                                    )}
                                >
                                    {isSelected && <Check className="h-3 w-3" />}
                                </div>
                                <span className="flex-1">{option.label}</span>
                                {option.description && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                type="button"
                                                className="ml-1 shrink-0 text-muted-foreground hover:text-foreground focus:outline-none"
                                                onClick={(e) => e.stopPropagation()}
                                                tabIndex={-1}
                                                aria-label={infoButtonLabel}
                                            >
                                                <Info className="size-3.5" />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="max-w-xs">
                                            <p>{option.description}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                            </div>
                        );
                    })}
                </div>
            </PopoverContent>
        </Popover>
    );
}
