import * as React from "react";
import { X, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Command,
    CommandGroup,
    CommandItem,
    CommandList,
    CommandEmpty,
} from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";

export type MultiSelectOption = {
    value: string;
    label: string;
};

export type MultiSelectProps = {
    options: MultiSelectOption[];
    value: MultiSelectOption[];
    onChange: (value: MultiSelectOption[]) => void;
    onSearchChange?: (search: string) => void;
    placeholder?: string;
    isLoading?: boolean;
    emptyMessage?: string;
};

export function MultiSelect({
    options,
    value,
    onChange,
    onSearchChange,
    placeholder = "Select...",
    isLoading = false,
    emptyMessage = "No results found.",
}: MultiSelectProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");

    const handleUnselect = (option: MultiSelectOption) => {
        onChange(value.filter((s) => s.value !== option.value));
    };

    const handleInputChange = (search: string) => {
        setInputValue(search);
        onSearchChange?.(search);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const input = inputRef.current;
        if (input) {
            if (e.key === "Delete" || e.key === "Backspace") {
                if (input.value === "") {
                    const newValue = [...value];
                    newValue.pop();
                    onChange(newValue);
                }
            }
            // This is not a default behaviour of the <input /> field
            if (e.key === "Escape") {
                input.blur();
            }
        }
    };

    const selectables = options.filter((option) => !value.some((v) => v.value === option.value));

    return (
        <Command onKeyDown={handleKeyDown} className="overflow-visible bg-transparent">
            {/* Selected items displayed above the search input */}
            {value.length > 0 && (
                <div className="flex gap-1 flex-wrap mb-2">
                    {value.map((option) => (
                        <Badge
                            key={option.value}
                            className="bg-background text-foreground border-muted-foreground/20 px-2 py-1"
                        >
                            {option.label}
                            <button
                                type="button"
                                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleUnselect(option);
                                    }
                                }}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                                onClick={() => handleUnselect(option)}
                            >
                                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
            {/* Search input */}
            <div className="group border bg-background border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <div className="flex gap-2 items-center">
                    {/* Avoid having the "Search" Icon */}
                    <CommandPrimitive.Input
                        ref={inputRef}
                        value={inputValue}
                        onValueChange={handleInputChange}
                        onBlur={() => setOpen(false)}
                        onFocus={() => setOpen(true)}
                        placeholder={placeholder}
                        className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                    />
                    {isLoading && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                </div>
            </div>
            <div className="relative mt-2">
                {open && (selectables.length > 0 || isLoading || inputValue.length >= 3) ? (
                    <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
                        <CommandList>
                            {isLoading && selectables.length === 0 ? (
                                <div className="py-6 text-center text-sm text-muted-foreground">
                                    <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                                </div>
                            ) : selectables.length === 0 && inputValue.length >= 3 ? (
                                <CommandEmpty>{emptyMessage}</CommandEmpty>
                            ) : selectables.length > 0 ? (
                                <CommandGroup className="h-full overflow-auto">
                                    {selectables.map((option) => (
                                        <CommandItem
                                            key={option.value}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                            onSelect={() => {
                                                setInputValue("");
                                                onSearchChange?.("");
                                                onChange([...value, option]);
                                            }}
                                            className={"cursor-pointer"}
                                        >
                                            {option.label}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            ) : null}
                        </CommandList>
                    </div>
                ) : null}
            </div>
        </Command>
    );
}
