import { cn } from "@/lib/utils.ts";

/** Class names shared by the partner dashboard pages and dialogs (design page "Partner Program", rows "Partner dashboard"). */
export const FOCUS_CLASS =
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass";

const PILL_CLASS = cn(
    "inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-pill text-sm font-medium disabled:cursor-not-allowed disabled:opacity-45",
    FOCUS_CLASS,
);

export const PRIMARY_PILL_CLASS = cn(PILL_CLASS, "bg-ink px-5 text-surface");

export const SECONDARY_PILL_CLASS = cn(
    PILL_CLASS,
    "px-5 text-ink shadow-[inset_0_0_0_1px_var(--line-strong)] hover:enabled:bg-surface-sunken",
);

/** An outline pill whose label is oxblood: opens a destructive confirmation. */
export const DANGER_OUTLINE_PILL_CLASS = cn(
    PILL_CLASS,
    "px-[18px] text-oxblood shadow-[inset_0_0_0_1px_var(--line-strong)] hover:enabled:shadow-[inset_0_0_0_1px_var(--oxblood)]",
);

export const DANGER_PILL_CLASS = cn(PILL_CLASS, "bg-oxblood px-5 text-on-oxblood");

export const SMALL_SECONDARY_PILL_CLASS = cn(
    "inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-pill px-4 text-meta font-medium text-ink shadow-[inset_0_0_0_1px_var(--line-strong)] hover:enabled:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-45",
    FOCUS_CLASS,
);

export const ICON_BUTTON_CLASS = cn(
    "inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-pill text-ink-secondary hover:enabled:bg-surface-sunken hover:enabled:text-ink disabled:cursor-not-allowed disabled:opacity-40",
    FOCUS_CLASS,
);

export const TEXT_LINK_CLASS = cn(
    "inline-flex min-h-8 items-center gap-1.5 text-sm font-medium underline decoration-line-strong underline-offset-3 hover:decoration-current",
    FOCUS_CLASS,
);

export const MONO_LABEL_CLASS = "font-mono text-[10px] tracking-[0.14em] text-ink-muted uppercase";

export const SECTION_HEADING_CLASS =
    "font-serif text-2xl leading-[1.12] font-normal sm:text-[30px] [&_em]:italic";

export const PAGE_TITLE_CLASS =
    "font-serif text-[40px] leading-[1.04] font-normal tracking-[-0.02em] sm:text-[clamp(40px,4.6vw,68px)] sm:leading-[1.02] [&_em]:italic";

export const FIELD_CLASS = cn(
    "h-11 w-full min-w-0 rounded-md border-0 bg-surface px-3 text-[15px] text-ink shadow-field placeholder:text-ink-placeholder aria-invalid:shadow-[inset_0_0_0_1.5px_var(--oxblood)] disabled:cursor-not-allowed disabled:opacity-60",
    FOCUS_CLASS,
);

export const FIELD_LABEL_CLASS = "text-meta font-medium text-ink data-[error=true]:text-oxblood";

export const FIELD_ERROR_CLASS = "text-meta text-oxblood";

export const DIALOG_CONTENT_CLASS =
    "gap-0 rounded-panel border-0 bg-surface-raised p-0 text-ink shadow-menu";

export const DIALOG_TITLE_CLASS = "font-serif text-[26px] leading-[1.15] font-normal [&_em]:italic";

export const DIALOG_DESCRIPTION_CLASS = "text-body-sm text-ink-secondary";

/** An inline alert inside a form or dialog: oxblood ring on the page ground. */
export const INLINE_ALERT_CLASS =
    "flex gap-2.5 rounded-md bg-surface p-3.5 text-body-sm text-ink shadow-[inset_0_0_0_1.5px_var(--oxblood)]";

/** A selectable option card (radio or checkbox) whose input sits inside it. */
export const OPTION_CARD_CLASS = cn(
    "flex cursor-pointer gap-3 rounded-md bg-surface-raised p-3.5 shadow-[inset_0_0_0_1px_var(--line)] has-checked:bg-surface has-checked:shadow-[inset_0_0_0_1.5px_var(--oxblood)] has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-brass has-disabled:cursor-not-allowed has-disabled:opacity-60",
);

/** The page column shared with the watchlist, account and search filter pages. */
export const PAGE_COLUMN_CLASS =
    "mx-auto w-full max-w-[calc(var(--container-content)+2*var(--page-gutter))] px-(--page-gutter)";
