import { cn } from "@/lib/utils.ts";
import { FOCUS_CLASS } from "@/features/account-management/lib/accountStyles.ts";

/**
 * Class names shared by the sign-in and registration forms (design boards "Auth · …").
 * The forms sit on the parchment ground, so fields and inset panels use `surface-raised`.
 */

export const AUTH_LABEL_CLASS = "text-meta font-medium text-ink";

export const AUTH_FIELD_CLASS = cn(
    "h-12 w-full min-w-0 rounded-md border-0 bg-surface-raised px-3.5 text-[15px] text-ink shadow-field placeholder:text-ink-placeholder disabled:opacity-60 aria-invalid:shadow-[inset_0_0_0_1.5px_var(--oxblood)]",
    FOCUS_CLASS,
);

export const AUTH_FIELD_MESSAGE_CLASS = "text-meta text-oxblood";

export const AUTH_PRIMARY_BUTTON_CLASS = cn(
    "inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2.5 rounded-pill bg-ink px-6 text-button text-surface disabled:cursor-not-allowed disabled:opacity-60",
    FOCUS_CLASS,
);

export const AUTH_OUTLINE_BUTTON_CLASS = cn(
    "inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2.5 rounded-pill px-6 text-button text-ink shadow-[inset_0_0_0_1px_var(--line-strong)] transition-shadow hover:shadow-[inset_0_0_0_1px_var(--ink)] disabled:cursor-not-allowed disabled:opacity-35",
    FOCUS_CLASS,
);

export const AUTH_GHOST_BUTTON_CLASS = cn(
    "inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-pill text-button text-ink-secondary transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-60",
    FOCUS_CLASS,
);

export const AUTH_LINK_CLASS = cn(
    "cursor-pointer rounded-xs font-medium text-ink underline decoration-line-strong underline-offset-3 transition-colors hover:text-brass-ink disabled:cursor-not-allowed disabled:no-underline disabled:opacity-60",
    FOCUS_CLASS,
);

/** Inset panel for the password policy and the consent checkboxes. */
export const AUTH_PANEL_CLASS = "rounded-lg bg-surface-raised p-4 shadow-field";

/** Hairline-topped footer row: switch between sign-in and registration, resend a code. */
export const AUTH_FOOTER_CLASS = "border-t border-line-subtle pt-5 text-body-sm text-ink-secondary";
