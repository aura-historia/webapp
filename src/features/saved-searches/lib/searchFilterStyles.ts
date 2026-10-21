import { cn } from "@/lib/utils.ts";

/** Class names shared by the search filter list, detail page and wizard (design page "Search Filters"). */
export const FOCUS_CLASS =
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass";

const PILL_CLASS = cn(
    "inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-pill text-sm font-medium disabled:cursor-not-allowed disabled:opacity-45",
    FOCUS_CLASS,
);

export const PRIMARY_PILL_CLASS = cn(PILL_CLASS, "bg-ink px-5 text-surface");

export const SECONDARY_PILL_CLASS = cn(
    PILL_CLASS,
    "px-4 text-ink shadow-[inset_0_0_0_1px_var(--line-strong)] hover:enabled:bg-surface-sunken",
);

export const GHOST_PILL_CLASS = cn(PILL_CLASS, "px-4 text-ink hover:enabled:bg-surface-sunken");

export const DANGER_PILL_CLASS = cn(PILL_CLASS, "bg-oxblood px-[22px] text-on-oxblood");

export const ICON_BUTTON_CLASS = cn(
    "inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-pill text-ink hover:enabled:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-40 data-[state=open]:bg-surface-sunken",
    FOCUS_CLASS,
);

export const MENU_CONTENT_CLASS =
    "w-60 rounded-panel border-0 bg-surface-raised p-1 text-ink shadow-menu";

export const MENU_ITEM_CLASS =
    "flex min-h-11 cursor-pointer items-center gap-2.5 rounded-md px-3 text-sm text-ink focus:bg-surface-sunken focus:text-ink data-highlighted:bg-surface-sunken [&_svg]:text-ink-muted";

export const MONO_LABEL_CLASS = "font-mono text-kicker tracking-[0.14em] text-ink-muted uppercase";

export const SECTION_HEADING_CLASS =
    "font-serif text-[30px] leading-[1.12] font-normal [&_em]:italic";

export const FIELD_CLASS = cn(
    "h-11 w-full min-w-0 rounded-md border-0 bg-surface px-3 text-[15px] text-ink shadow-field placeholder:text-ink-placeholder aria-invalid:shadow-[inset_0_0_0_1.5px_var(--oxblood)] disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:opacity-60",
    FOCUS_CLASS,
);

/** The page column shared with the watchlist and account pages. */
export const PAGE_COLUMN_CLASS =
    "mx-auto w-full max-w-[calc(var(--container-content)+2*var(--page-gutter))] px-(--page-gutter)";
