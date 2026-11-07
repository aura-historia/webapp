/**
 * Shared class strings for the consent banner (design boards "Legal · Consent banner").
 */

const CONSENT_BUTTON_BASE_CLASS =
    "inline-flex h-11 cursor-pointer items-center justify-center rounded-pill px-[22px] font-sans text-[14px] font-medium transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass motion-reduce:transition-none";

/** "Reject all" and "Accept all": the same ink pill, so neither choice is favoured. */
export const CONSENT_DECISION_BUTTON_CLASS = `${CONSENT_BUTTON_BASE_CLASS} bg-ink text-surface hover:bg-ink-secondary md:min-w-[148px]`;

/** "Save selection": an outline pill. */
export const CONSENT_SELECTION_BUTTON_CLASS = `${CONSENT_BUTTON_BASE_CLASS} text-ink shadow-[inset_0_0_0_1px_var(--line-strong)] hover:shadow-[inset_0_0_0_1px_var(--ink)]`;

export const CONSENT_LINK_CLASS =
    "underline decoration-line-strong underline-offset-3 transition-colors hover:text-brass-ink hover:decoration-current focus-visible:rounded-xs focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass";
