import { cn } from "@/lib/utils.ts";

/** Class names shared by the account page's section cards and forms (design board "Account"). */
export const FOCUS_CLASS =
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass";

export const CARD_CLASS = "rounded-panel bg-surface-raised p-5 text-ink shadow-ring sm:p-8";

export const GROUP_LABEL_CLASS = "font-mono text-kicker text-ink-muted uppercase";

export const LABEL_CLASS = "text-meta font-medium text-ink data-[error=true]:text-oxblood";

export const FIELD_CLASS = cn(
    "h-12 w-full min-w-0 rounded-md border-0 bg-surface px-3.5 text-[15px] text-ink shadow-field placeholder:text-ink-placeholder aria-invalid:shadow-[inset_0_0_0_1.5px_var(--oxblood)]",
    FOCUS_CLASS,
);

export const FIELD_MESSAGE_CLASS = "text-meta text-oxblood";

export const PRIMARY_BUTTON_CLASS = cn(
    "inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2.5 rounded-pill bg-ink px-6 text-button text-surface disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto",
    FOCUS_CLASS,
);

export const SECONDARY_BUTTON_CLASS = cn(
    "inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2.5 rounded-pill px-[22px] text-button text-ink shadow-[inset_0_0_0_1px_var(--line-strong)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto",
    FOCUS_CLASS,
);

export const FORM_FOOTER_CLASS = "flex justify-end border-t border-line-subtle pt-5";
