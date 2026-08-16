import { Check, ChevronsUpDown } from "lucide-react";
import {
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
    type KeyboardEvent,
    type ReactNode,
} from "react";
import { FormControl } from "@/components/ui/form.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.tsx";
import { cn } from "@/lib/utils.ts";

export type SearchableCurrencyOption = {
    readonly value: string;
    readonly label: string;
    readonly searchTerms?: readonly string[];
};

type SearchableCurrencySelectProps = {
    readonly options: readonly SearchableCurrencyOption[];
    readonly value: string;
    readonly onValueChange: (value: string) => void;
    readonly placeholder: string;
    readonly searchPlaceholder: string;
    readonly emptyMessage: string;
    readonly className?: string;
    readonly id?: string;
    readonly ariaLabel?: string;
    readonly align?: "start" | "center" | "end";
    readonly disabled?: boolean;
    readonly formControl?: boolean;
    readonly renderOption?: (option: SearchableCurrencyOption) => ReactNode;
    readonly renderValue?: (option: SearchableCurrencyOption | undefined) => ReactNode;
};

export function SearchableCurrencySelect({
    options,
    value,
    onValueChange,
    placeholder,
    searchPlaceholder,
    emptyMessage,
    className,
    id,
    ariaLabel,
    align = "start",
    disabled = false,
    formControl = false,
    renderOption,
    renderValue,
}: SearchableCurrencySelectProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const optionRefs = useRef(new Map<string, HTMLButtonElement>());
    const listboxId = useId();
    const optionIdPrefix = useId();

    const selectedOption = options.find((option) => option.value === value);
    const accessibleLabel = ariaLabel ?? placeholder;
    const normalizedSearch = search.trim().toLocaleLowerCase();
    const filteredOptions = useMemo(() => {
        if (!normalizedSearch) return options;

        return options.filter((option) =>
            [option.value, option.label, ...(option.searchTerms ?? [])].some((searchTerm) =>
                searchTerm.toLocaleLowerCase().includes(normalizedSearch),
            ),
        );
    }, [normalizedSearch, options]);

    useEffect(() => {
        if (!open) return;

        const highlightedOption = filteredOptions[highlightedIndex];
        if (highlightedOption) {
            optionRefs.current.get(highlightedOption.value)?.scrollIntoView({ block: "nearest" });
        }
    }, [filteredOptions, highlightedIndex, open]);

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (isOpen) {
            setSearch("");
            setHighlightedIndex(0);
        }
    };

    const selectOption = (option: SearchableCurrencyOption) => {
        onValueChange(option.value);
        handleOpenChange(false);
    };

    const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setHighlightedIndex((index) => Math.min(index + 1, filteredOptions.length - 1));
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();
            setHighlightedIndex((index) => Math.max(index - 1, 0));
        }

        if (event.key === "Enter" && filteredOptions[highlightedIndex]) {
            event.preventDefault();
            selectOption(filteredOptions[highlightedIndex]);
        }
    };

    const trigger = (
        <button
            type="button"
            id={id}
            role="combobox"
            aria-label={accessibleLabel}
            aria-expanded={open}
            aria-controls={listboxId}
            disabled={disabled}
            className={cn(
                "flex h-9 items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:ring-destructive/40",
                className,
            )}
        >
            <span className="min-w-0 truncate text-left">
                {renderValue?.(selectedOption) ?? selectedOption?.label ?? (
                    <span className="text-muted-foreground">{placeholder}</span>
                )}
            </span>
            <ChevronsUpDown className="size-4 shrink-0 opacity-50" aria-hidden="true" />
        </button>
    );

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            {formControl ? (
                <FormControl>
                    <PopoverTrigger asChild>{trigger}</PopoverTrigger>
                </FormControl>
            ) : (
                <PopoverTrigger asChild>{trigger}</PopoverTrigger>
            )}
            <PopoverContent
                align={align}
                className="w-full p-0"
                onOpenAutoFocus={(event) => {
                    event.preventDefault();
                    searchInputRef.current?.focus();
                }}
            >
                <div className="border-b p-2">
                    <input
                        ref={searchInputRef}
                        type="search"
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value);
                            setHighlightedIndex(0);
                        }}
                        onKeyDown={handleSearchKeyDown}
                        placeholder={searchPlaceholder}
                        aria-label={searchPlaceholder}
                        aria-activedescendant={
                            filteredOptions[highlightedIndex]
                                ? `${optionIdPrefix}-${filteredOptions[highlightedIndex].value}`
                                : undefined
                        }
                        className="flex h-8 w-full rounded-sm border border-input bg-background px-2 py-1 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    />
                </div>
                <div
                    id={listboxId}
                    role="listbox"
                    aria-label={accessibleLabel}
                    className="max-h-[min(16rem,var(--radix-popover-content-available-height))] overflow-y-auto overscroll-contain p-1"
                >
                    {filteredOptions.length === 0 ? (
                        <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                            {emptyMessage}
                        </p>
                    ) : (
                        filteredOptions.map((option, index) => {
                            const selected = option.value === value;
                            const highlighted = index === highlightedIndex;

                            return (
                                <button
                                    type="button"
                                    key={option.value}
                                    id={`${optionIdPrefix}-${option.value}`}
                                    ref={(element) => {
                                        if (element) {
                                            optionRefs.current.set(option.value, element);
                                        } else {
                                            optionRefs.current.delete(option.value);
                                        }
                                    }}
                                    role="option"
                                    aria-selected={selected}
                                    onMouseEnter={() => setHighlightedIndex(index)}
                                    onClick={() => selectOption(option)}
                                    className={cn(
                                        "flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground",
                                        highlighted && "bg-accent text-accent-foreground",
                                    )}
                                >
                                    <Check
                                        className={cn(
                                            "size-4 shrink-0",
                                            selected ? "opacity-100" : "opacity-0",
                                        )}
                                        aria-hidden="true"
                                    />
                                    <span className="min-w-0 flex-1">
                                        {renderOption?.(option) ?? option.label}
                                    </span>
                                </button>
                            );
                        })
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
