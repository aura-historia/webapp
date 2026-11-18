import { cn } from "@/lib/utils.ts";

/** Class names of the content notice form (Redesign, Legal page, "Content notice" rows). */
export const FOCUS_CLASS =
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass";

export const SECTION_NUMBER_CLASS = "font-mono text-xs tracking-[0.14em] text-brass-ink";

export const SECTION_TITLE_CLASS =
    "font-serif text-2xl leading-[1.15] font-normal tracking-[-0.01em] sm:text-[28px]";

export const LABEL_CLASS = "text-meta font-medium text-ink";

export const HINT_CLASS = "text-xs leading-normal text-ink-muted";

export const FIELD_CLASS = cn(
    "h-12 w-full min-w-0 rounded-md border-0 bg-surface-raised px-3.5 text-[15px] text-ink shadow-field placeholder:text-ink-muted aria-invalid:shadow-[inset_0_0_0_1.5px_var(--oxblood)] disabled:cursor-not-allowed disabled:opacity-60",
    FOCUS_CLASS,
);

export const TEXTAREA_CLASS = cn(
    "min-h-[168px] w-full resize-y rounded-md border-0 bg-surface-raised px-3.5 py-3 text-[15px] leading-[1.55] text-ink shadow-field placeholder:text-ink-muted aria-invalid:shadow-[inset_0_0_0_1.5px_var(--oxblood)] disabled:cursor-not-allowed disabled:opacity-60",
    FOCUS_CLASS,
);

export const FIELD_ERROR_CLASS = "flex items-start gap-1.5 text-meta leading-[1.4] text-oxblood";

/**
 * A radio option card: oxblood ring and filled radio when checked, an oxblood ring on every
 * unchecked card while its group is invalid.
 */
export const OPTION_CARD_CLASS = cn(
    "flex min-h-11 cursor-pointer items-start gap-3 rounded-md bg-surface p-3.5 shadow-field",
    "has-checked:bg-surface-raised has-checked:shadow-[inset_0_0_0_1.5px_var(--oxblood)]",
    "data-[invalid=true]:shadow-[inset_0_0_0_1.5px_var(--oxblood)]",
    "has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-brass",
    "has-disabled:cursor-not-allowed has-disabled:opacity-60",
);

export const RADIO_CLASS =
    "mt-px size-[18px] shrink-0 cursor-pointer appearance-none rounded-pill bg-surface-raised shadow-[inset_0_0_0_1.5px_var(--ink-muted)] outline-none checked:bg-on-oxblood checked:shadow-[inset_0_0_0_5px_var(--oxblood)]";

export const PRIMARY_BUTTON_CLASS = cn(
    "inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2.5 rounded-pill bg-ink px-7 text-button text-surface disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto",
    FOCUS_CLASS,
);

export const SECONDARY_BUTTON_CLASS = cn(
    "inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-pill px-6 text-button text-ink shadow-[inset_0_0_0_1px_var(--line-strong)] hover:bg-surface-sunken",
    FOCUS_CLASS,
);

export const SMALL_SECONDARY_BUTTON_CLASS = cn(
    "inline-flex h-11 cursor-pointer items-center gap-2 self-start rounded-pill pr-[18px] pl-3.5 text-sm font-medium text-ink shadow-[inset_0_0_0_1px_var(--line-strong)] hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-60",
    FOCUS_CLASS,
);

export const TEXT_LINK_CLASS = cn(
    "text-ink underline decoration-line-strong underline-offset-3 hover:text-oxblood hover:decoration-oxblood",
    FOCUS_CLASS,
);

/** Raised alert with an oxblood ring: the error summary and the server alerts. */
export const ALERT_CLASS = "flex gap-3 rounded-lg bg-surface-raised px-[18px] py-4";

export const MONO_LABEL_CLASS = "font-mono text-[11px] tracking-[0.14em] text-ink-muted uppercase";

/** The quiet "Report this listing / provider" link on listing and provider pages. */
export const REPORT_LINK_CLASS = cn(
    "inline-flex min-h-11 items-center gap-2 text-meta text-ink-secondary underline decoration-line-strong underline-offset-3 transition-colors hover:text-oxblood hover:decoration-oxblood",
    FOCUS_CLASS,
);
