/** Shared class strings for the provider page, from the Redesign's Providers boards. */

export const SHOP_FOCUS_CLASS =
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass";

/** Page column: the content width plus the page gutter, like the watchlist and account pages. */
export const SHOP_PAGE_CLASS =
    "mx-auto w-full max-w-[calc(var(--container-content)+2*var(--page-gutter))] px-(--page-gutter) pt-8 pb-24 sm:pt-14 sm:pb-36";

/**
 * Two columns on phones, three from 768px, four from 1180px. The 1180px step is written in rem
 * (73.75rem): Tailwind orders a px breakpoint before the rem-based `md:` rule, which then wins.
 */
export const SHOP_GRID_CLASS =
    "grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-6 sm:gap-y-10 md:grid-cols-3 min-[73.75rem]:grid-cols-4";

export const SHOP_PRIMARY_BUTTON_CLASS = `inline-flex h-11 items-center justify-center gap-2 rounded-pill bg-ink px-5 text-sm font-medium text-surface ${SHOP_FOCUS_CLASS}`;

/** Mono uppercase label under a heading, e.g. "Most recently updated first". */
export const SHOP_MONO_LABEL_CLASS =
    "font-mono text-[10px] leading-[1.4] tracking-[0.14em] text-ink-muted uppercase sm:text-[11px]";

export const SHOP_TEXT_LINK_CLASS = `inline-flex min-h-11 shrink-0 cursor-pointer items-center text-meta font-medium text-ink underline decoration-line-strong underline-offset-3 hover:text-brass-ink sm:text-sm ${SHOP_FOCUS_CLASS}`;
