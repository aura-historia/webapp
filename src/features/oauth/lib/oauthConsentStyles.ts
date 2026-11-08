import { FOCUS_CLASS } from "@/features/partner/common/lib/partnerDashboardStyles.ts";
import { cn } from "@/lib/utils.ts";

/** Class names shared by the consent pages (design board "Partner · WooCommerce connection consent"). */
export const CONSENT_TITLE_CLASS =
    "font-serif text-[32px] leading-[1.1] font-normal tracking-[-0.01em] text-ink sm:text-[38px]";

export const CONSENT_CARD_CLASS =
    "flex flex-col gap-[22px] rounded-card bg-surface-raised p-5 text-ink shadow-ring sm:gap-6 sm:p-8";

/** An inset panel on the page ground inside the card: recipient, notices, the no-provider panel. */
export const CONSENT_PANEL_CLASS = "flex flex-col rounded-lg bg-surface shadow-field";

export const CONSENT_EYEBROW_CLASS =
    "font-mono text-[11px] leading-[1.4] tracking-[0.14em] text-brass-ink uppercase";

export const CONSENT_COPY_CLASS = "text-[15px] leading-[1.6] text-ink-secondary";

export const CONSENT_HEADING_CLASS = "text-sm leading-normal font-medium text-ink";

export const CONSENT_NOTE_CLASS = "text-meta leading-[1.6] text-ink-secondary";

export const CONSENT_ACTIONS_CLASS =
    "flex flex-col gap-3 border-t border-line-subtle pt-6 sm:flex-row-reverse sm:justify-start";

const CONSENT_BUTTON_CLASS = cn(
    "inline-flex h-12 w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-pill px-6 text-[15px] leading-none font-medium disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto",
    FOCUS_CLASS,
);

/** Authorize: the one oxblood action on the page. */
export const CONSENT_BRAND_BUTTON_CLASS = cn(CONSENT_BUTTON_CLASS, "bg-oxblood text-on-oxblood");

export const CONSENT_PRIMARY_BUTTON_CLASS = cn(CONSENT_BUTTON_CLASS, "bg-ink text-surface");

export const CONSENT_OUTLINE_BUTTON_CLASS = cn(
    CONSENT_BUTTON_CLASS,
    "bg-transparent text-ink shadow-[inset_0_0_0_1px_var(--line-strong)] hover:enabled:shadow-[inset_0_0_0_1px_var(--ink)]",
);

/** An alert inside the card: oxblood ring on a faint oxblood wash. */
export const CONSENT_ALERT_CLASS =
    "flex items-start gap-3 rounded-lg bg-[color-mix(in_srgb,var(--oxblood)_6%,var(--surface-raised))] px-4 py-3.5 shadow-[inset_0_0_0_1px_var(--oxblood)]";
