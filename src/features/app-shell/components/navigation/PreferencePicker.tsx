import { Check, Search, X } from "lucide-react";
import {
    type KeyboardEvent,
    type ReactNode,
    type RefObject,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.tsx";
import { useMediaQuery } from "@/hooks/common/useMediaQuery.ts";
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
    /** Form-field wiring for the trigger; all optional. */
    readonly triggerId?: string;
    readonly disabled?: boolean;
    readonly invalid?: boolean;
    readonly describedBy?: string;
}

const FOCUS_CLASS =
    "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-brass";

function matches(option: PreferenceOption, query: string): boolean {
    return [option.value, option.label, option.code, option.detail, ...(option.searchTerms ?? [])]
        .filter((term): term is string => Boolean(term))
        .some((term) => term.toLocaleLowerCase().includes(query));
}

/**
 * A locale preference picker: a parchment popover anchored to the trigger from 768px, a bottom
 * sheet below, each with a mono title, an optional search field and a listbox whose selected row
 * carries an oxblood check. The popover puts focus in the search field; the sheet puts it on the
 * list, so a phone's keyboard only opens when the search field is tapped.
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
    triggerId,
    disabled,
    invalid,
    describedBy,
}: PreferencePickerProps) {
    const { t } = useTranslation();
    const desktop = useMediaQuery("(min-width: 768px)");
    const sheet = !desktop;
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

    /** `typing`: the search field has focus, so Home, End and Space stay with the text. */
    const handleKeyDown = (event: KeyboardEvent<HTMLElement>, typing: boolean) => {
        const last = visibleOptions.length - 1;
        const moves: Record<string, () => number> = {
            ArrowDown: () => Math.min(highlighted + 1, last),
            ArrowUp: () => Math.max(highlighted - 1, 0),
            Home: () => 0,
            End: () => last,
        };
        const move = moves[event.key];

        if (move && (!typing || event.key.startsWith("Arrow"))) {
            event.preventDefault();
            setHighlighted(move());
            return;
        }

        if (event.key === "Enter" || (event.key === " " && !typing)) {
            if (highlightedOption) {
                event.preventDefault();
                select(highlightedOption);
            }
        }
    };

    const activeDescendant = highlightedOption ? optionId(highlightedOption) : undefined;
    // The list takes keys itself when nothing else does: without a search field, and in the
    // sheet, where focus starts on the list rather than the search field.
    const listboxOwnsKeys = !search || sheet;

    const searchField = search && (
        <div
            className={cn(
                "flex shrink-0 items-center gap-2 rounded-md bg-surface shadow-field has-focus-visible:outline-2 has-focus-visible:outline-solid has-focus-visible:outline-offset-2 has-focus-visible:outline-brass",
                sheet ? "h-11 px-3" : "h-10 px-2.5",
            )}
        >
            <Search
                aria-hidden="true"
                className={cn("shrink-0 text-ink-muted", sheet ? "size-4" : "size-3.5")}
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
                onKeyDown={(event) => handleKeyDown(event, true)}
                className={cn(
                    "min-w-0 flex-1 border-0 bg-transparent text-ink outline-none placeholder:text-ink-placeholder [&::-webkit-search-cancel-button]:hidden",
                    // 16px keeps iOS Safari from zooming into the field when it is tapped.
                    sheet ? "h-10 text-base" : "h-9 text-sm",
                )}
            />
        </div>
    );

    const list = (
        <PreferenceList
            listboxRef={listboxRef}
            listboxId={listboxId}
            label={label}
            options={visibleOptions}
            value={value}
            highlighted={highlighted}
            optionId={optionId}
            ownsKeys={listboxOwnsKeys}
            activeDescendant={activeDescendant}
            sheet={sheet}
            onKeyDown={(event) => handleKeyDown(event, false)}
            onSelect={select}
            onHighlight={setHighlighted}
        />
    );

    const empty = visibleOptions.length === 0 && search && (
        <p role="status" className="px-2.5 py-3 text-meta text-ink-muted">
            {search.emptyMessage}
        </p>
    );

    const triggerProps = {
        "aria-haspopup": "listbox" as const,
        id: triggerId,
        disabled,
        "aria-label": `${label}: ${displayValue}`,
        "aria-invalid": invalid || undefined,
        "aria-describedby": describedBy,
        className: cn(
            "cursor-pointer disabled:cursor-not-allowed data-[state=open]:text-ink",
            triggerClassName,
        ),
        children: triggerContent ?? displayValue,
    };

    if (sheet) {
        return (
            <Drawer open={open} onOpenChange={handleOpenChange}>
                <DrawerTrigger {...triggerProps} />
                <DrawerContent
                    data-theme="light"
                    aria-describedby={undefined}
                    onOpenAutoFocus={(event) => {
                        event.preventDefault();
                        listboxRef.current?.focus({ preventScroll: true });
                    }}
                    // Above the phone menu (z-60), which opens the language, currency and unit pickers.
                    overlayClassName="z-[70]"
                    className="z-[70] rounded-t-[20px] border-0 bg-surface-raised text-ink shadow-menu"
                >
                    <div className="flex min-h-0 flex-col gap-1.5 px-3 pt-1.5 pb-2">
                        <div className="flex items-center justify-between gap-3 pl-2.5">
                            <DrawerTitle className="font-mono text-kicker font-normal text-ink-muted uppercase">
                                {label}
                            </DrawerTitle>
                            <DrawerClose
                                aria-label={t("common.close")}
                                className={cn(
                                    "inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-pill text-ink-muted outline-none hover:bg-surface-sunken",
                                    FOCUS_CLASS,
                                )}
                            >
                                <X aria-hidden="true" className="size-[18px]" strokeWidth={1.8} />
                            </DrawerClose>
                        </div>
                        {searchField}
                        {list}
                        {empty}
                    </div>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger {...triggerProps} />
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
                {searchField}
                {list}
                {empty}
            </PopoverContent>
        </Popover>
    );
}

interface PreferenceListProps {
    readonly listboxRef: RefObject<HTMLDivElement | null>;
    readonly listboxId: string;
    readonly label: string;
    readonly options: readonly PreferenceOption[];
    readonly value: string;
    readonly highlighted: number;
    readonly optionId: (option: PreferenceOption) => string;
    /** Whether the list is in the tab order and handles the arrow keys itself. */
    readonly ownsKeys: boolean;
    readonly activeDescendant: string | undefined;
    readonly sheet: boolean;
    readonly onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
    readonly onSelect: (option: PreferenceOption) => void;
    readonly onHighlight: (index: number) => void;
}

function PreferenceList({
    listboxRef,
    listboxId,
    label,
    options,
    value,
    highlighted,
    optionId,
    ownsKeys,
    activeDescendant,
    sheet,
    onKeyDown,
    onSelect,
    onHighlight,
}: PreferenceListProps) {
    return (
        <div
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            aria-label={label}
            tabIndex={ownsKeys ? 0 : -1}
            aria-activedescendant={ownsKeys ? activeDescendant : undefined}
            onKeyDown={ownsKeys ? onKeyDown : undefined}
            className={cn(
                "flex flex-col overflow-y-auto overscroll-contain outline-none",
                sheet ? "min-h-0 flex-1" : "max-h-[312px]",
                ownsKeys && cn("rounded-md", FOCUS_CLASS),
            )}
        >
            {options.map((option, index) => {
                const isSelected = option.value === value;
                return (
                    // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard selection runs on the listbox or search field via aria-activedescendant.
                    <div
                        key={option.value}
                        id={optionId(option)}
                        role="option"
                        tabIndex={-1}
                        aria-selected={isSelected}
                        onClick={() => onSelect(option)}
                        onPointerMove={() => onHighlight(index)}
                        className={cn(
                            "flex shrink-0 cursor-pointer items-center gap-2.5 rounded-md px-2.5 text-ink select-none",
                            sheet ? "min-h-12 text-[15px]" : "min-h-11 text-sm",
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
    );
}
