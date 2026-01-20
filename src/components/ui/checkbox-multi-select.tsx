import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
    readonly selectedCountLabel?: (count: number) => string;
};

export function CheckboxMultiSelect({
    options,
    value,
    onChange,
    placeholder = "Select...",
    allSelectedLabel = "All",
    selectedCountLabel = (count: number) => `${count} selected`,
}: CheckboxMultiSelectProps) {
    const [open, setOpen] = React.useState(false);

    const handleToggle = (optionValue: string) => {
        if (value.includes(optionValue)) {
            onChange(value.filter((v) => v !== optionValue));
        } else {
            onChange([...value, optionValue]);
        }
    };

    const handleToggleAll = () => {
        if (allSelected) {
            onChange([]);
        } else {
            onChange(options.map((opt) => opt.value));
        }
    };

    const handleRemove = (optionValue: string) => {
        onChange(value.filter((v) => v !== optionValue));
    };

    const selectedOptions = options.filter((opt) => value.includes(opt.value));
    const allSelected = value.length === options.length;
    const noneSelected = value.length === 0;

    const getDisplayText = () => {
        if (noneSelected) {
            return placeholder;
        }
        if (allSelected) {
            return allSelectedLabel;
        }
        return selectedCountLabel(value.length);
    };

    return (
        <div>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <div
                        role="combobox"
                        aria-expanded={open}
                        tabIndex={0}
                        className="flex h-9 w-full cursor-pointer items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs"
                    >
                        <span className="truncate">{getDisplayText()}</span>
                        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                    </div>
                </PopoverTrigger>
                <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0"
                    align="start"
                >
                    <div className="max-h-60 overflow-auto p-1">
                        {/* All option */}
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
                        {/* Individual options */}
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
            {/* Selected items displayed below the dropdown */}
            {!allSelected && !noneSelected && (
                <div className="flex gap-1 flex-wrap mt-2">
                    {selectedOptions.map((option) => (
                        <Badge
                            key={option.value}
                            className="bg-background text-sm text-foreground border-muted-foreground/20 px-2 py-1"
                        >
                            {option.label}
                            <button
                                type="button"
                                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove(option.value);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.stopPropagation();
                                        handleRemove(option.value);
                                    }
                                }}
                            >
                                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}
