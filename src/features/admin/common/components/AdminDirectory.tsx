import { Slot } from "@radix-ui/react-slot";
import {
    Check,
    ChevronDown,
    ChevronRight,
    Loader2,
    Search,
    SlidersHorizontal,
    X,
} from "lucide-react";
import type { ButtonHTMLAttributes, CSSProperties, FormEvent, ReactNode } from "react";
import { createContext, useCallback, useContext, useId, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import {
    AdminMark,
    type AdminMarkTone,
} from "@/features/admin/common/components/AdminStatusMark.tsx";
import {
    ADMIN_SELECT_CLASS,
    ADMIN_SKELETON_CLASS,
    FIELD_CLASS,
    FIELD_ERROR_CLASS,
    FIELD_LABEL_CLASS,
    FOCUS_CLASS,
    PRIMARY_PILL_CLASS,
    SECONDARY_PILL_CLASS,
    TEXT_LINK_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import { cn } from "@/lib/utils.ts";

/*
 * The shared directory used by every admin list page (board "Admin · Directory"): toolbar with
 * search, quick filters and the full filter panel; removable chips for active filters; a result
 * line with sort; a ruled ledger with mono column headings from 1024px; and Load more.
 */

const PILL_TRIGGER_CLASS = cn(
    "inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-pill px-4 text-sm whitespace-nowrap hover:shadow-[inset_0_0_0_1px_var(--ink)]",
    FOCUS_CLASS,
);

/** Lets the filter panel close the toolbar after Apply or Reset. */
const PanelCloseContext = createContext<(() => void) | undefined>(undefined);

// ─── Toolbar ────────────────────────────────────────────────────────────────

/**
 * The toolbar row. `search` submits on Enter; `quickFilters` apply at once; `panel` is the full
 * filter form, shown under the row while open.
 */
export function AdminToolbar({
    label,
    search,
    quickFilters,
    panel,
    panelLabel,
    panelCount = 0,
    chips,
}: {
    /** Accessible name of the search landmark, e.g. "Filter users". */
    readonly label: string;
    readonly search?: {
        readonly label: string;
        readonly value: string;
        readonly onChange: (value: string) => void;
        readonly onSubmit: () => void;
    };
    readonly quickFilters?: ReactNode;
    /** Rendered while the panel is open; receives a close callback. */
    /** The full filter form (an `AdminFilterPanel`); it closes itself after Apply or Reset. */
    readonly panel?: ReactNode;
    /** Panel button label; defaults to "All filters", or "Filters" when there is no other control. */
    readonly panelLabel?: string;
    /** Active filters that live only in the panel. */
    readonly panelCount?: number;
    readonly chips?: ReactNode;
}) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const closePanel = useCallback(() => setOpen(false), []);
    const panelId = useId();
    const searchId = useId();

    function submitSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        search?.onSubmit();
    }

    return (
        <section aria-label={label} className="mb-5 flex flex-col gap-3.5">
            <div className="flex flex-wrap items-center gap-2.5">
                {search && (
                    <form
                        role="search"
                        onSubmit={submitSearch}
                        className="relative min-w-0 flex-[1_1_280px]"
                    >
                        <label htmlFor={searchId} className="sr-only">
                            {search.label}
                        </label>
                        <Search
                            aria-hidden="true"
                            className="pointer-events-none absolute top-[13px] left-3.5 size-[17px] text-ink-muted"
                            strokeWidth={1.8}
                        />
                        <input
                            id={searchId}
                            type="search"
                            value={search.value}
                            placeholder={search.label}
                            onChange={(event) => search.onChange(event.target.value)}
                            className={cn(
                                "h-11 w-full min-w-0 rounded-pill border-0 bg-surface-raised pr-3.5 pl-[42px] text-[15px] text-ink shadow-field placeholder:text-ink-placeholder",
                                FOCUS_CLASS,
                            )}
                        />
                    </form>
                )}
                {quickFilters}
                {panel && (
                    <button
                        type="button"
                        aria-expanded={open}
                        aria-controls={panelId}
                        onClick={() => setOpen((value) => !value)}
                        className={cn(
                            PILL_TRIGGER_CLASS,
                            "font-medium shadow-[inset_0_0_0_1px_var(--line-strong)]",
                            open && "bg-surface-sunken",
                        )}
                    >
                        <SlidersHorizontal
                            aria-hidden="true"
                            className="size-4"
                            strokeWidth={1.8}
                        />
                        {panelLabel ??
                            t(
                                search || quickFilters
                                    ? "adminCommon.filters.all"
                                    : "adminCommon.filters.title",
                            )}
                        {panelCount > 0 && (
                            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-pill bg-oxblood px-1.5 text-[11px] text-on-oxblood tabular-nums">
                                {panelCount}
                            </span>
                        )}
                    </button>
                )}
            </div>
            {panel && open && (
                <PanelCloseContext.Provider value={closePanel}>
                    <div id={panelId}>{panel}</div>
                </PanelCloseContext.Provider>
            )}
            {chips}
        </section>
    );
}

// ─── Quick filters ──────────────────────────────────────────────────────────

type QuickOption = { readonly value: string; readonly label: string };

/** A pill that opens a single-choice list; applies at once. An empty value means "All". */
export function AdminQuickSelect({
    label,
    value,
    options,
    allLabel,
    onChange,
}: {
    readonly label: string;
    readonly value: string;
    readonly options: readonly QuickOption[];
    readonly allLabel?: string;
    readonly onChange: (value: string) => void;
}) {
    const { t } = useTranslation();
    const all = allLabel ?? t("adminCommon.filters.any");
    const current = options.find((option) => option.value === value)?.label ?? all;
    const active = value !== "";
    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger
                className={cn(
                    PILL_TRIGGER_CLASS,
                    active
                        ? "bg-surface-raised shadow-[inset_0_0_0_1px_var(--ink)]"
                        : "shadow-[inset_0_0_0_1px_var(--line-strong)]",
                )}
            >
                <span className="text-ink-secondary">{label}</span>
                <span className="font-medium">{current}</span>
                <ChevronDown
                    aria-hidden="true"
                    className="size-3.5 text-ink-muted"
                    strokeWidth={1.8}
                />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className={MENU_CLASS}>
                <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
                    <DropdownMenuRadioItem value="" className={MENU_ITEM_CLASS}>
                        {all}
                    </DropdownMenuRadioItem>
                    {options.map((option) => (
                        <DropdownMenuRadioItem
                            key={option.value}
                            value={option.value}
                            className={MENU_ITEM_CLASS}
                        >
                            {option.label}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

/** A pill that opens a multi-choice list; applies at once. No selection means "All". */
export function AdminQuickMulti({
    label,
    values,
    options,
    onChange,
}: {
    readonly label: string;
    readonly values: readonly string[];
    readonly options: readonly QuickOption[];
    readonly onChange: (values: string[]) => void;
}) {
    const { t } = useTranslation();
    const selected = options.filter((option) => values.includes(option.value));
    let summary = t("adminCommon.filters.selected", { count: selected.length });
    if (selected.length === 0) summary = t("adminCommon.filters.any");
    else if (selected.length <= 2) summary = selected.map((option) => option.label).join(", ");
    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger
                className={cn(
                    PILL_TRIGGER_CLASS,
                    selected.length > 0
                        ? "bg-surface-raised shadow-[inset_0_0_0_1px_var(--ink)]"
                        : "shadow-[inset_0_0_0_1px_var(--line-strong)]",
                )}
            >
                <span className="text-ink-secondary">{label}</span>
                <span className="font-medium">{summary}</span>
                <ChevronDown
                    aria-hidden="true"
                    className="size-3.5 text-ink-muted"
                    strokeWidth={1.8}
                />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className={MENU_CLASS}>
                {options.map((option) => (
                    <DropdownMenuCheckboxItem
                        key={option.value}
                        checked={values.includes(option.value)}
                        onSelect={(event) => event.preventDefault()}
                        onCheckedChange={(checked) =>
                            onChange(
                                checked
                                    ? [...values, option.value]
                                    : values.filter((value) => value !== option.value),
                            )
                        }
                        className={MENU_ITEM_CLASS}
                    >
                        {option.label}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

const MENU_CLASS = "min-w-52 rounded-lg border-0 bg-surface-raised p-1.5 text-ink shadow-menu";
const MENU_ITEM_CLASS =
    "min-h-10 cursor-pointer rounded-md text-sm focus:bg-surface-sunken data-highlighted:bg-surface-sunken [&_svg]:text-oxblood";

// ─── Filter panel and fields ────────────────────────────────────────────────

/** The full filter form: fields in a grid, Reset and Apply under a hairline. */
export function AdminFilterPanel({
    onApply,
    onReset,
    children,
}: {
    /** Return `false` when the draft is invalid, to keep the panel open. */
    readonly onApply: () => boolean | void;
    readonly onReset: () => void;
    readonly children: ReactNode;
}) {
    const { t } = useTranslation();
    const closePanel = useContext(PanelCloseContext);
    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (onApply() !== false) closePanel?.();
    }
    return (
        <form
            noValidate
            onSubmit={submit}
            className="flex flex-col gap-6 rounded-panel bg-surface-raised p-5 shadow-ring sm:p-7"
        >
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                {children}
            </div>
            <div className="flex flex-wrap justify-end gap-2.5 border-t border-line-subtle pt-5">
                <button
                    type="button"
                    onClick={() => {
                        onReset();
                        closePanel?.();
                    }}
                    className={SECONDARY_PILL_CLASS}
                >
                    {t("adminCommon.filters.reset")}
                </button>
                <button type="submit" className={PRIMARY_PILL_CLASS}>
                    {t("adminCommon.filters.apply")}
                </button>
            </div>
        </form>
    );
}

/** A labelled text input for the filter panel and record forms. */
export function AdminTextField({
    label,
    value,
    onChange,
    error,
    type = "search",
    mono = false,
    placeholder,
    inputMode,
    maxLength,
    className,
    raised = false,
}: {
    readonly label: string;
    readonly value: string;
    readonly onChange: (value: string) => void;
    readonly error?: string;
    readonly type?: "search" | "text" | "email" | "tel" | "url" | "password";
    readonly mono?: boolean;
    readonly placeholder?: string;
    readonly inputMode?: "text" | "numeric" | "decimal" | "email" | "tel" | "url";
    readonly maxLength?: number;
    readonly className?: string;
    /** Use the raised field ground (on parchment pages); dialogs and panels use the default. */
    readonly raised?: boolean;
}) {
    const id = useId();
    const errorId = `${id}-error`;
    return (
        <div className={cn("flex min-w-0 flex-col gap-2", className)}>
            <label
                htmlFor={id}
                className={FIELD_LABEL_CLASS}
                data-error={error ? "true" : undefined}
            >
                {label}
            </label>
            <input
                id={id}
                type={type}
                value={value}
                placeholder={placeholder}
                inputMode={inputMode}
                maxLength={maxLength}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                onChange={(event) => onChange(event.target.value)}
                className={cn(
                    FIELD_CLASS,
                    raised && "bg-surface-raised",
                    mono && "font-mono text-[13px]",
                )}
            />
            {error && (
                <p id={errorId} className={FIELD_ERROR_CLASS}>
                    {error}
                </p>
            )}
        </div>
    );
}

/** A labelled native select with the design's chevron. */
export function AdminSelectField({
    label,
    value,
    onChange,
    options,
    error,
    className,
    raised = false,
    disabled,
}: {
    readonly label: string;
    readonly value: string;
    readonly onChange: (value: string) => void;
    readonly options: readonly { readonly value: string; readonly label: string }[];
    readonly error?: string;
    readonly className?: string;
    readonly raised?: boolean;
    readonly disabled?: boolean;
}) {
    const id = useId();
    const errorId = `${id}-error`;
    return (
        <div className={cn("flex min-w-0 flex-col gap-2", className)}>
            <label
                htmlFor={id}
                className={FIELD_LABEL_CLASS}
                data-error={error ? "true" : undefined}
            >
                {label}
            </label>
            <AdminSelect
                id={id}
                value={value}
                onChange={onChange}
                options={options}
                invalid={Boolean(error)}
                describedBy={error ? errorId : undefined}
                raised={raised}
                disabled={disabled}
            />
            {error && (
                <p id={errorId} className={FIELD_ERROR_CLASS}>
                    {error}
                </p>
            )}
        </div>
    );
}

/** The bare select with its chevron, for custom labels. */
export function AdminSelect({
    id,
    value,
    onChange,
    options,
    invalid,
    describedBy,
    raised,
    disabled,
    ariaLabel,
    className,
}: {
    readonly id?: string;
    readonly value: string;
    readonly onChange: (value: string) => void;
    readonly options: readonly { readonly value: string; readonly label: string }[];
    readonly invalid?: boolean;
    readonly describedBy?: string;
    readonly raised?: boolean;
    readonly disabled?: boolean;
    readonly ariaLabel?: string;
    readonly className?: string;
}) {
    return (
        <div className={cn("relative", className)}>
            <select
                id={id}
                value={value}
                disabled={disabled}
                aria-label={ariaLabel}
                aria-invalid={invalid ? true : undefined}
                aria-describedby={describedBy}
                onChange={(event) => onChange(event.target.value)}
                className={cn(ADMIN_SELECT_CLASS, raised && "bg-surface-raised")}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute top-[14px] right-3 size-[15px] text-ink-muted"
                strokeWidth={1.8}
            />
        </div>
    );
}

/** From and until days (UTC) for a date range filter. */
export function AdminDateRangeField({
    legend,
    from,
    until,
    onFromChange,
    onUntilChange,
    error,
}: {
    readonly legend: string;
    readonly from: string;
    readonly until: string;
    readonly onFromChange: (value: string) => void;
    readonly onUntilChange: (value: string) => void;
    readonly error?: string;
}) {
    const { t } = useTranslation();
    const errorId = useId();
    return (
        <fieldset className="flex min-w-0 flex-col gap-2">
            <legend
                className={cn(FIELD_LABEL_CLASS, "mb-2")}
                data-error={error ? "true" : undefined}
            >
                {legend} <span className="font-normal text-ink-muted">(UTC)</span>
            </legend>
            <div className="grid grid-cols-2 gap-2">
                <input
                    type="date"
                    value={from}
                    aria-label={t("adminCommon.filters.from", { field: legend })}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : undefined}
                    onChange={(event) => onFromChange(event.target.value)}
                    className={cn(FIELD_CLASS, "px-2.5 text-sm tabular-nums")}
                />
                <input
                    type="date"
                    value={until}
                    aria-label={t("adminCommon.filters.until", { field: legend })}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : undefined}
                    onChange={(event) => onUntilChange(event.target.value)}
                    className={cn(FIELD_CLASS, "px-2.5 text-sm tabular-nums")}
                />
            </div>
            {error && (
                <p id={errorId} className={FIELD_ERROR_CLASS}>
                    {error}
                </p>
            )}
        </fieldset>
    );
}

/** A group of toggle pills (checkboxes) for multi-value filters. */
export function AdminCheckGroup({
    legend,
    options,
    values,
    onChange,
    className,
}: {
    readonly legend: string;
    readonly options: readonly QuickOption[];
    readonly values: readonly string[];
    readonly onChange: (values: string[]) => void;
    readonly className?: string;
}) {
    return (
        <fieldset className={cn("flex min-w-0 flex-col", className)}>
            <legend className={cn(FIELD_LABEL_CLASS, "mb-2")}>{legend}</legend>
            <div className="flex flex-wrap gap-1.5">
                {options.map((option) => {
                    const checked = values.includes(option.value);
                    return (
                        <label
                            key={option.value}
                            className={cn(
                                "inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-pill pr-3 pl-2.5 text-meta has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-brass",
                                checked
                                    ? "bg-surface-sunken shadow-[inset_0_0_0_1px_var(--ink)]"
                                    : "bg-surface shadow-[inset_0_0_0_1px_var(--line)]",
                            )}
                        >
                            <input
                                type="checkbox"
                                checked={checked}
                                onChange={(event) =>
                                    onChange(
                                        event.target.checked
                                            ? [...values, option.value]
                                            : values.filter((value) => value !== option.value),
                                    )
                                }
                                className="size-[15px] accent-oxblood"
                            />
                            {option.label}
                        </label>
                    );
                })}
            </div>
        </fieldset>
    );
}

// ─── Chips and result line ──────────────────────────────────────────────────

export type AdminChip = {
    readonly key: string;
    readonly label: string;
    readonly onRemove: () => void;
};

/** Removable chips for every active filter, with Clear all. */
export function AdminActiveChips({
    chips,
    onClearAll,
}: {
    readonly chips: readonly AdminChip[];
    readonly onClearAll: () => void;
}) {
    const { t } = useTranslation();
    if (chips.length === 0) return null;
    return (
        <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 font-mono text-[10px] tracking-[0.14em] text-ink-muted uppercase">
                {t("adminCommon.filters.active")}
            </span>
            {chips.map((chip) => (
                <button
                    key={chip.key}
                    type="button"
                    onClick={chip.onRemove}
                    aria-label={t("adminCommon.filters.remove", { filter: chip.label })}
                    className={cn(
                        "inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-sm bg-surface-sunken pr-2 pl-3 text-meta hover:bg-line-subtle",
                        FOCUS_CLASS,
                    )}
                >
                    {chip.label}
                    <X aria-hidden="true" className="size-[13px]" strokeWidth={1.9} />
                </button>
            ))}
            <button
                type="button"
                onClick={onClearAll}
                className={cn(TEXT_LINK_CLASS, "ml-1.5 text-meta")}
            >
                {t("adminCommon.filters.clearAll")}
            </button>
        </div>
    );
}

/** Mono loaded/total line on the left, the sort choice on the right. */
export function AdminResultLine({
    summary,
    sort,
}: {
    readonly summary: string;
    readonly sort?: ReactNode;
}) {
    return (
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
            <output className="block font-mono text-[11px] tracking-[0.12em] text-ink-secondary uppercase">
                {summary}
            </output>
            {sort}
        </div>
    );
}

/** The sort control: a borderless native select prefixed by "Sort". */
export function AdminSortSelect({
    value,
    options,
    onChange,
}: {
    readonly value: string;
    readonly options: readonly QuickOption[];
    readonly onChange: (value: string) => void;
}) {
    const { t } = useTranslation();
    const id = useId();
    return (
        <div className="flex items-center gap-1.5 text-meta">
            <label htmlFor={id} className="text-ink-secondary">
                {t("adminCommon.sort")}
            </label>
            <div className="relative">
                <select
                    id={id}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className={cn(
                        "min-h-9 cursor-pointer appearance-none rounded-sm border-0 bg-transparent py-0 pr-6 pl-1 font-medium text-ink",
                        FOCUS_CLASS,
                    )}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <ChevronDown
                    aria-hidden="true"
                    className="pointer-events-none absolute top-[11px] right-1 size-3.5 text-ink-muted"
                    strokeWidth={1.8}
                />
            </div>
        </div>
    );
}

// ─── Ledger ─────────────────────────────────────────────────────────────────

/**
 * The ruled list. `columns` is the grid template used from 1024px for the header and every row
 * (the last track is the chevron); below 1024px rows wrap and each cell shows its own label.
 */
export function AdminLedger({
    label,
    columns,
    headings,
    children,
}: {
    readonly label: string;
    readonly columns: string;
    /** Column headings, one per cell after the first; must be unique (they key the header). */
    readonly headings: readonly string[];
    readonly children: ReactNode;
}) {
    const style = { "--admin-cols": columns } as CSSProperties;
    return (
        <div style={style} className="flex flex-col">
            <div
                aria-hidden="true"
                className="hidden gap-5 border-b border-line px-3 pb-2.5 lg:grid lg:grid-cols-(--admin-cols)"
            >
                {headings.map((heading) => (
                    <span
                        key={heading}
                        className="font-mono text-[10px] tracking-[0.14em] text-ink-muted uppercase"
                    >
                        {heading}
                    </span>
                ))}
                <span />
            </div>
            <ul aria-label={label} className="border-t border-line lg:border-t-0">
                {children}
            </ul>
        </div>
    );
}

const ROW_CLASS = cn(
    "flex min-h-[68px] w-full cursor-pointer flex-wrap items-center gap-x-3.5 gap-y-2 rounded-sm border-0 bg-transparent px-1 py-3.5 text-left text-ink hover:bg-surface-raised lg:grid lg:grid-cols-(--admin-cols) lg:gap-5 lg:px-3 lg:py-3 [&:hover_.admin-row-chevron]:translate-x-0.5 [&:hover_.admin-row-chevron]:text-ink",
    FOCUS_CLASS,
);

/** One row. Pass a button or a router Link as the only child with `asChild`; put cells inside it. */
export function AdminLedgerRow({
    asChild = false,
    selected = false,
    children,
    ...props
}: {
    readonly asChild?: boolean;
    readonly selected?: boolean;
    readonly children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
    const Comp = asChild ? Slot : "button";
    return (
        <li className="border-b border-line-subtle">
            <Comp
                {...(asChild ? {} : { type: "button" as const })}
                {...props}
                className={cn(ROW_CLASS, selected && "bg-surface-raised")}
            >
                {children}
            </Comp>
        </li>
    );
}

/** The trailing chevron (desktop only). */
export function AdminRowChevron() {
    return (
        <ChevronRight
            aria-hidden="true"
            className="admin-row-chevron hidden size-4 justify-self-end text-ink-muted transition-transform motion-reduce:transition-none lg:block"
            strokeWidth={1.8}
        />
    );
}

/** The first cell: title over a sub line, optionally led by a status mark. Full width on phones. */
export function AdminPrimaryCell({
    title,
    sub,
    mark,
    titleMono = false,
    subMono = false,
    titleMuted = false,
}: {
    readonly title: string;
    readonly sub?: string;
    readonly mark?: AdminMarkTone;
    readonly titleMono?: boolean;
    readonly subMono?: boolean;
    /** A missing value, shown in italics ("No title recorded"). */
    readonly titleMuted?: boolean;
}) {
    return (
        <span className="flex min-w-0 basis-full items-center gap-2 lg:basis-auto">
            {mark && <AdminMark tone={mark} />}
            <span className="flex min-w-0 flex-col gap-0.5">
                <span
                    className={cn(
                        "truncate font-medium",
                        titleMono ? "font-mono text-sm" : "text-[15px]",
                        titleMuted && "font-normal text-ink-muted italic",
                    )}
                >
                    {title}
                </span>
                {sub && (
                    <span
                        className={cn(
                            "truncate text-ink-secondary",
                            subMono ? "font-mono text-[11px]" : "text-meta",
                        )}
                    >
                        {sub}
                    </span>
                )}
            </span>
        </span>
    );
}

/** Any other cell; `head` shows as a mono label below 1024px, where the header row is hidden. */
export function AdminCell({
    head,
    children,
    className,
}: {
    readonly head: string;
    readonly children: ReactNode;
    readonly className?: string;
}) {
    return (
        <span className={cn("flex min-w-0 items-center gap-2 text-sm", className)}>
            <span className="font-mono text-[9px] tracking-[0.14em] text-ink-muted uppercase lg:sr-only">
                {head}
            </span>
            {children}
        </span>
    );
}

/** Skeleton rows matching the ledger while the first page loads. */
export function AdminLedgerSkeleton({
    rows = 5,
    label,
}: {
    readonly rows?: number;
    readonly label: string;
}) {
    return (
        <div aria-busy="true">
            <output aria-label={label} className="sr-only">
                {label}
            </output>
            <ul className="border-t border-line">
                {Array.from({ length: rows }, (_, index) => (
                    <li
                        // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton rows
                        key={index}
                        className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] items-center gap-5 border-b border-line-subtle px-3 py-4"
                    >
                        <span className="flex flex-col gap-2">
                            <span className={cn(ADMIN_SKELETON_CLASS, "h-3.5 w-3/5")} />
                            <span className={cn(ADMIN_SKELETON_CLASS, "h-2.5 w-2/5")} />
                        </span>
                        <span className={cn(ADMIN_SKELETON_CLASS, "h-5 w-2/3 rounded-sm")} />
                        <span className={cn(ADMIN_SKELETON_CLASS, "h-3 w-1/2")} />
                    </li>
                ))}
            </ul>
        </div>
    );
}

/**
 * The row under the ledger: Load more while pages remain, a spinner while one loads, an alert with
 * Try again when the next page failed (loaded rows stay), and the oxblood check at the end.
 */
export function AdminLoadMore({
    hasNextPage,
    isFetchingNextPage,
    isError = false,
    onLoadMore,
    label,
    endLabel,
}: {
    readonly hasNextPage: boolean;
    readonly isFetchingNextPage: boolean;
    readonly isError?: boolean;
    readonly onLoadMore: () => void;
    readonly label: string;
    /** Shown once every page is loaded; leave out to show nothing at the end. */
    readonly endLabel?: string;
}) {
    const { t } = useTranslation();
    if (!hasNextPage && !isFetchingNextPage && !endLabel) return null;
    const failed = isError && !isFetchingNextPage;
    const more = !failed && (hasNextPage || isFetchingNextPage);
    return (
        <div className="flex flex-wrap items-center justify-center gap-4 border-b border-line py-5">
            {failed && (
                <div className="flex flex-col items-center gap-2.5">
                    <p role="alert" className="text-meta text-oxblood">
                        {t("adminCommon.loadMoreFailed")}
                    </p>
                    <button type="button" onClick={onLoadMore} className={SECONDARY_PILL_CLASS}>
                        {t("adminCommon.retry")}
                    </button>
                </div>
            )}
            {more && (
                <button
                    type="button"
                    onClick={onLoadMore}
                    disabled={isFetchingNextPage}
                    className={SECONDARY_PILL_CLASS}
                >
                    {isFetchingNextPage && (
                        <Loader2
                            aria-hidden="true"
                            className="size-[15px] animate-spin motion-reduce:animate-none"
                        />
                    )}
                    {isFetchingNextPage ? t("adminCommon.loading") : label}
                </button>
            )}
            {!failed && !more && (
                <output className="flex items-center gap-2.5 text-sm text-ink-secondary">
                    <span
                        aria-hidden="true"
                        className="inline-flex size-[22px] items-center justify-center rounded-pill bg-oxblood text-on-oxblood"
                    >
                        <Check className="size-[11px]" strokeWidth={3} />
                    </span>
                    {endLabel}
                </output>
            )}
        </div>
    );
}
