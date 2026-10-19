import { Check, Search } from "lucide-react";
import {
    type KeyboardEvent,
    type ReactNode,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.tsx";
import { cn } from "@/lib/utils.ts";

export interface PreferenceOption {
    readonly value: string;
    readonly label: string;
    /** Mono code column before the label (currency codes). */
    readonly code?: string;
    /** Mono detail at the end of the row (language code, currency symbol, units). */
    readonly detail?: string;
    readonly searchTerms?: readonly string[];
}

interface PreferencePickerProps {
    readonly label: string;
    readonly displayValue: string;
    readonly value: string;
    readonly options: readonly PreferenceOption[];
    readonly onChange: (value: string) => void;
    readonly triggerClassName: string;
    /** Trigger content in place of the plain display value (form fields). */
    readonly triggerContent?: ReactNode;
    /** Adds the search field above the list (currencies). */
    readonly search?: {
        readonly label: string;
        readonly placeholder: string;
        readonly emptyMessage: string;
    };
    readonly className?: string;
}

const ROW_CLASS =
    "flex min-h-11 cursor-pointer items-center gap-2.5 rounded-md px-2.5 text-sm text-ink select-none";

function matches(option: PreferenceOption, query: string): boolean {
    return [option.value, option.label, option.code, option.detail, ...(option.searchTerms ?? [])]
        .filter((term): term is string => Boolean(term))
        .some((term) => term.toLocaleLowerCase().includes(query));
}

/**
 * A locale preference picker: a parchment popover with a mono title, an optional search
 * field and a listbox whose selected row carries an oxblood check.
 */
export function PreferencePicker({
    label,
    displayValue,
    value,
    options,
    onChange,
    triggerClassName,
    triggerContent,
    search,
    className,
}: PreferencePickerProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [highlighted, setHighlighted] = useState(0);
    const listboxId = useId();
    const optionIdPrefix = useId();
    const searchId = useId();
    const listboxRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const normalizedQuery = query.trim().toLocaleLowerCase();
    const visibleOptions = useMemo(
        () =>
            normalizedQuery
                ? options.filter((option) => matches(option, normalizedQuery))
                : options,
        [normalizedQuery, options],
    );
    const highlightedOption = visibleOptions[highlighted];
    const optionId = (option: PreferenceOption) => `${optionIdPrefix}-${option.value}`;

    useEffect(() => {
        if (!open || !highlightedOption) return;
        document
            .getElementById(`${optionIdPrefix}-${highlightedOption.value}`)
            ?.scrollIntoView({ block: "nearest" });
    }, [highlightedOption, open, optionIdPrefix]);

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (isOpen) {
            setQuery("");
            setHighlighted(
                Math.max(
                    options.findIndex((option) => option.value === value),
                    0,
                ),
            );
        }
    };

    const select = (option: PreferenceOption) => {
        if (option.value !== value) {
            onChange(option.value);
        }
        setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        const last = visibleOptions.length - 1;
        const moves: Record<string, () => number> = {
            ArrowDown: () => Math.min(highlighted + 1, last),
            ArrowUp: () => Math.max(highlighted - 1, 0),
            Home: () => 0,
            End: () => last,
        };
        const move = moves[event.key];

        if (move && (search === undefined || event.key.startsWith("Arrow"))) {
            event.preventDefault();
            setHighlighted(move());
            return;
        }

        if (event.key === "Enter" || (event.key === " " && search === undefined)) {
            if (highlightedOption) {
                event.preventDefault();
                select(highlightedOption);
            }
        }
    };

    const activeDescendant = highlightedOption ? optionId(highlightedOption) : undefined;

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger
                aria-haspopup="listbox"
                aria-label={`${label}: ${displayValue}`}
                className={cn("cursor-pointer data-[state=open]:text-ink", triggerClassName)}
            >
                {triggerContent ?? displayValue}
            </PopoverTrigger>
            <PopoverContent
                data-theme="light"
                align="start"
                sideOffset={10}
                collisionPadding={16}
                onOpenAutoFocus={(event) => {
                    event.preventDefault();
                    (search ? searchRef.current : listboxRef.current)?.focus();
                }}
                className={cn(
                    "z-[70] flex w-[min(18rem,calc(100vw-2rem))] flex-col gap-1.5 rounded-panel border-0 bg-surface-raised p-2 text-ink shadow-menu",
                    className,
                )}
            >
                <span
                    aria-hidden="true"
                    className="px-2.5 pt-2.5 pb-0.5 font-mono text-kicker text-ink-muted uppercase"
                >
                    {label}
                </span>

                {search && (
                    <div className="flex h-10 items-center gap-2 rounded-md bg-surface px-2.5 shadow-field has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brass">
                        <Search
                            aria-hidden="true"
                            className="size-3.5 shrink-0 text-ink-muted"
                            strokeWidth={2}
                        />
                        <label htmlFor={searchId} className="sr-only">
                            {search.label}
                        </label>
                        <input
                            ref={searchRef}
                            id={searchId}
                            type="search"
                            role="combobox"
                            aria-expanded={true}
                            aria-controls={listboxId}
                            aria-activedescendant={activeDescendant}
                            aria-autocomplete="list"
                            autoComplete="off"
                            value={query}
                            placeholder={search.placeholder}
                            onChange={(event) => {
                                setQuery(event.target.value);
                                setHighlighted(0);
                            }}
                            onKeyDown={handleKeyDown}
                            className="h-9 min-w-0 flex-1 border-0 bg-transparent text-sm text-ink outline-none placeholder:text-ink-placeholder [&::-webkit-search-cancel-button]:hidden"
                        />
                    </div>
                )}

                <div
                    ref={listboxRef}
                    id={listboxId}
                    role="listbox"
                    aria-label={label}
                    tabIndex={search ? -1 : 0}
                    aria-activedescendant={search ? undefined : activeDescendant}
                    onKeyDown={search ? undefined : handleKeyDown}
                    className={cn(
                        "flex max-h-[312px] flex-col overflow-y-auto overscroll-contain outline-none",
                        !search &&
                            "rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass",
                    )}
                >
                    {visibleOptions.map((option, index) => {
                        const isSelected = option.value === value;
                        return (
                            // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard selection runs on the listbox or search field via aria-activedescendant.
                            <div
                                key={option.value}
                                id={optionId(option)}
                                role="option"
                                tabIndex={-1}
                                aria-selected={isSelected}
                                onClick={() => select(option)}
                                onPointerMove={() => setHighlighted(index)}
                                className={cn(
                                    ROW_CLASS,
                                    isSelected && "font-medium",
                                    index === highlighted && "bg-surface-sunken",
                                )}
                            >
                                {isSelected ? (
                                    <Check
                                        aria-hidden="true"
                                        className="size-4 shrink-0 text-oxblood"
                                        strokeWidth={2}
                                    />
                                ) : (
                                    <span aria-hidden="true" className="w-4 shrink-0" />
                                )}
                                {option.code && (
                                    <span className="w-[34px] shrink-0 font-mono text-[11px] font-normal tracking-[0.08em] text-ink-muted">
                                        {option.code}
                                    </span>
                                )}
                                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                                {option.detail && (
                                    <span className="shrink-0 font-mono text-[10px] font-normal tracking-[0.08em] text-ink-muted uppercase">
                                        {option.detail}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
                {visibleOptions.length === 0 && search && (
                    <p role="status" className="px-2.5 py-3 text-meta text-ink-muted">
                        {search.emptyMessage}
                    </p>
                )}
            </PopoverContent>
        </Popover>
    );
}
