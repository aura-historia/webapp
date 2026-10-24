import { Command as CommandPrimitive } from "cmdk";
import { Check, Loader2, Search, X } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

export type MultiSelectOption = {
    value: string;
    label: string;
};

export type MultiSelectProps = {
    options: MultiSelectOption[];
    value: MultiSelectOption[];
    onChange: (value: MultiSelectOption[]) => void;
    onSearchChange?: (search: string) => void;
    /** Id of the search input, for an external `<label htmlFor>`. */
    id?: string;
    placeholder?: string;
    isLoading?: boolean;
    emptyMessage?: string;
    /** Accessible name of the selected list, e.g. "Included providers". */
    selectedLabel?: string;
    /** Label of each chip's remove button; receives the option label. */
    removeLabel?: (label: string) => string;
    /** `exclude` strikes the selected chips through instead of filling them. */
    tone?: "include" | "exclude";
};

const FOCUS_CLASS =
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass";

/**
 * A searchable multi-select: a search field over a listbox with ticks on the chosen options,
 * and the chosen options as removable pills below it.
 */
export function MultiSelect({
    options,
    value,
    onChange,
    onSearchChange,
    id,
    placeholder = "Select...",
    isLoading = false,
    emptyMessage = "No results found.",
    selectedLabel,
    removeLabel = (label) => label,
    tone = "include",
}: MultiSelectProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");

    const isSelected = (option: MultiSelectOption) => value.some((v) => v.value === option.value);

    const handleUnselect = (option: MultiSelectOption) => {
        onChange(value.filter((s) => s.value !== option.value));
    };

    const handleToggle = (option: MultiSelectOption) => {
        if (isSelected(option)) {
            handleUnselect(option);
            return;
        }
        setInputValue("");
        onSearchChange?.("");
        onChange([...value, option]);
    };

    const handleInputChange = (search: string) => {
        setInputValue(search);
        onSearchChange?.(search);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const input = inputRef.current;
        if (!input) return;
        if ((e.key === "Delete" || e.key === "Backspace") && input.value === "") {
            onChange(value.slice(0, -1));
        }
        if (e.key === "Escape") {
            input.blur();
        }
    };

    const showList = open && (options.length > 0 || isLoading || inputValue.length > 0);

    return (
        <CommandPrimitive
            onKeyDown={handleKeyDown}
            shouldFilter={false}
            className="flex flex-col gap-2 overflow-visible"
        >
            <div className="relative">
                <div className="flex h-12 items-center gap-2 rounded-md bg-surface-raised px-3 shadow-field focus-within:outline-2 focus-within:outline-offset-3 focus-within:outline-brass lg:h-10">
                    <Search
                        aria-hidden="true"
                        className="size-[15px] shrink-0 text-ink-muted"
                        strokeWidth={2}
                    />
                    <CommandPrimitive.Input
                        ref={inputRef}
                        id={id}
                        value={inputValue}
                        onValueChange={handleInputChange}
                        onBlur={() => setOpen(false)}
                        onFocus={() => setOpen(true)}
                        placeholder={placeholder}
                        className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-placeholder lg:text-sm"
                    />
                </div>
                {showList && (
                    <div className="absolute top-full right-0 left-0 z-20 mt-2.5 rounded-panel bg-surface-raised p-1.5 shadow-menu">
                        <CommandPrimitive.List>
                            {isLoading && options.length === 0 ? (
                                <div className="flex justify-center py-4 text-ink-muted">
                                    <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                                </div>
                            ) : (
                                <>
                                    <CommandPrimitive.Empty className="px-2.5 py-2 text-body-sm text-ink-muted">
                                        {emptyMessage}
                                    </CommandPrimitive.Empty>
                                    {options.map((option) => {
                                        const selected = isSelected(option);
                                        return (
                                            <CommandPrimitive.Item
                                                key={option.value}
                                                value={option.value}
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                }}
                                                onSelect={() => handleToggle(option)}
                                                aria-selected={selected}
                                                className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-md px-2.5 text-body-sm text-ink data-[selected=true]:bg-surface-sunken"
                                            >
                                                <span className="min-w-0 flex-1 truncate">
                                                    {option.label}
                                                </span>
                                                <Check
                                                    aria-hidden="true"
                                                    strokeWidth={2.4}
                                                    className={cn(
                                                        "size-4 shrink-0 text-oxblood",
                                                        !selected && "opacity-0",
                                                    )}
                                                />
                                            </CommandPrimitive.Item>
                                        );
                                    })}
                                </>
                            )}
                        </CommandPrimitive.List>
                    </div>
                )}
            </div>
            {value.length > 0 && (
                <ul aria-label={selectedLabel} className="flex flex-wrap gap-1.5">
                    {value.map((option) => (
                        <li
                            key={option.value}
                            className={cn(
                                "inline-flex h-8 max-w-full items-center gap-1 rounded-pill pr-1 pl-3 text-meta",
                                tone === "include"
                                    ? "bg-ink text-surface"
                                    : "text-ink shadow-[inset_0_0_0_1px_var(--line-strong)]",
                            )}
                        >
                            <span
                                className={cn(
                                    "min-w-0 truncate",
                                    tone === "exclude" && "line-through decoration-ink-muted",
                                )}
                            >
                                {option.label}
                            </span>
                            <button
                                type="button"
                                aria-label={removeLabel(option.label)}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                                onClick={() => handleUnselect(option)}
                                className={cn(
                                    "inline-flex size-[26px] shrink-0 cursor-pointer items-center justify-center rounded-pill",
                                    FOCUS_CLASS,
                                )}
                            >
                                <X aria-hidden="true" className="size-3" strokeWidth={2.2} />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </CommandPrimitive>
    );
}
