import { cn } from "@/lib/utils.ts";

export {
    DANGER_PILL_CLASS,
    FIELD_CLASS,
    FIELD_ERROR_CLASS,
    FIELD_LABEL_CLASS,
    FOCUS_CLASS,
    ICON_BUTTON_CLASS,
    INLINE_ALERT_CLASS,
    MONO_LABEL_CLASS,
    OPTION_CARD_CLASS,
    PAGE_COLUMN_CLASS,
    PRIMARY_PILL_CLASS,
    SECONDARY_PILL_CLASS,
    SMALL_SECONDARY_PILL_CLASS,
    TEXT_LINK_CLASS,
} from "@/features/partner/common/lib/partnerDashboardStyles.ts";

import { FOCUS_CLASS } from "@/features/partner/common/lib/partnerDashboardStyles.ts";

/** Class names shared by the admin pages (design page "Admin"). */

/** Page title: the section name alone, no lead and no rule under it. */
export const ADMIN_PAGE_TITLE_CLASS =
    "font-serif text-[40px] leading-[1.04] font-normal tracking-[-0.02em] sm:text-[clamp(40px,4.6vw,68px)] sm:leading-[1.02]";

/** A record page's title (an organization, a listing, an auction). */
export const ADMIN_RECORD_TITLE_CLASS =
    "font-serif text-[34px] leading-[1.06] font-normal tracking-[-0.015em] break-words sm:text-[clamp(34px,3.6vw,52px)]";

/** A section heading inside a page or dialog. */
export const ADMIN_SECTION_TITLE_CLASS = "font-serif text-2xl leading-[1.2] font-normal";

/** Larger section heading on record pages. */
export const ADMIN_PAGE_SECTION_TITLE_CLASS =
    "font-serif text-[26px] leading-[1.12] font-normal tracking-[-0.01em] sm:text-[30px]";

/** Eyebrow above a title: mono, brass-ink. */
export const ADMIN_EYEBROW_CLASS =
    "font-mono text-[10px] tracking-[0.16em] text-brass-ink uppercase";

/** Numbered form legend, e.g. "01 · SOURCE". */
export const ADMIN_LEGEND_CLASS =
    "mb-4 w-full font-mono text-[10px] tracking-[0.14em] text-ink-muted uppercase";

/** Field on a raised ground (dialogs on parchment use FIELD_CLASS instead). */
export const ADMIN_RAISED_FIELD_CLASS = cn(
    "h-11 w-full min-w-0 rounded-md border-0 bg-surface-raised px-3 text-[15px] text-ink shadow-field placeholder:text-ink-placeholder aria-invalid:shadow-[inset_0_0_0_1.5px_var(--oxblood)] disabled:cursor-not-allowed disabled:opacity-60",
    FOCUS_CLASS,
);

/** A native select styled as a field; pair with a chevron icon positioned inside. */
export const ADMIN_SELECT_CLASS = cn(
    "h-11 w-full min-w-0 cursor-pointer appearance-none rounded-md border-0 bg-surface py-0 pr-9 pl-3 text-[15px] text-ink shadow-field aria-invalid:shadow-[inset_0_0_0_1.5px_var(--oxblood)] disabled:cursor-not-allowed disabled:opacity-60",
    FOCUS_CLASS,
);

/** A danger outline pill: oxblood ring and label (opens an inline confirmation). */
export const ADMIN_DANGER_OUTLINE_CLASS = cn(
    "inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-pill px-5 text-sm font-medium text-oxblood shadow-[inset_0_0_0_1.5px_var(--oxblood)] hover:enabled:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-45",
    FOCUS_CLASS,
);

/** Smaller (40px) variants for actions inside sections and confirmations. */
export const ADMIN_SMALL_PRIMARY_CLASS = cn(
    "inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-pill bg-ink px-4 text-meta font-medium text-surface disabled:cursor-not-allowed disabled:opacity-45",
    FOCUS_CLASS,
);

export const ADMIN_SMALL_DANGER_CLASS = cn(
    "inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-pill bg-oxblood px-4 text-meta font-medium text-on-oxblood disabled:cursor-not-allowed disabled:opacity-45",
    FOCUS_CLASS,
);

export const ADMIN_SMALL_DANGER_OUTLINE_CLASS = cn(
    "inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-pill px-4 text-meta font-medium text-oxblood shadow-[inset_0_0_0_1.5px_var(--oxblood)] hover:enabled:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-45",
    FOCUS_CLASS,
);

/** 36px pill for row actions (Revoke on a ledger row). */
export const ADMIN_ROW_ACTION_CLASS = cn(
    "inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-pill px-3.5 text-meta font-medium text-ink shadow-[inset_0_0_0_1px_var(--line-strong)] hover:enabled:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-45",
    FOCUS_CLASS,
);

/** A raised panel (cards, the filter panel, location cards). */
export const ADMIN_PANEL_CLASS = "rounded-panel bg-surface-raised shadow-ring";

/** An inset block on a raised ground (inside dialogs). */
export const ADMIN_INSET_CLASS = "rounded-md bg-surface shadow-ring";

/** Small filled tag (role, tier, scope). */
export const ADMIN_TAG_CLASS =
    "inline-flex items-center rounded-sm bg-surface-sunken px-2 py-0.5 text-xs whitespace-nowrap text-ink";

/** Strong tag (Administrator, explicit grant). */
export const ADMIN_STRONG_TAG_CLASS =
    "inline-flex items-center rounded-sm bg-ink px-2 py-0.5 text-xs whitespace-nowrap text-surface";

/** Mono identifier text. */
export const ADMIN_MONO_CLASS = "font-mono text-xs break-all text-ink-secondary";

/** Record dialog content (a raised card with a menu shadow). */
export const ADMIN_DIALOG_CONTENT_CLASS =
    "max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-card border-0 bg-surface-raised p-0 text-ink shadow-menu";

/** Skeleton bar. */
export const ADMIN_SKELETON_CLASS =
    "animate-pulse rounded-xs bg-surface-sunken motion-reduce:animate-none";
