import { NAV_FOCUS_CLASS } from "@/features/app-shell/components/navigation/navigationConfig.ts";
import { cn } from "@/lib/utils.ts";

/** A chapter opener split in two from 1080px: the heading on the left, its companion on the right. */
export const PRESS_SPLIT_CLASS =
    "grid gap-4 sm:gap-6 min-[1080px]:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] min-[1080px]:items-end min-[1080px]:gap-[clamp(40px,6vw,96px)]";

/** The intro paragraph beside a chapter heading. */
export const PRESS_INTRO_CLASS =
    "max-w-[540px] text-base leading-relaxed text-pretty text-ink-secondary sm:text-body-lg";

/** The mono label above a list, a figure or a value. */
export const PRESS_LABEL_CLASS = "font-mono text-label text-ink-muted uppercase";

/** A raised panel with the hairline ring. */
export const PRESS_PANEL_CLASS = "rounded-card bg-surface-raised shadow-ring";

/** The serif heading of a card or panel. */
export const PRESS_CARD_TITLE_CLASS =
    "font-serif text-[22px] leading-[1.2] font-normal sm:text-2xl [&_em]:italic";

/** A quiet text link with an arrow or an outbound mark. */
export const PRESS_TEXT_LINK_CLASS = cn(
    "inline-flex min-h-11 items-center gap-2 self-start text-body-sm font-medium text-ink underline-offset-4 hover:underline",
    NAV_FOCUS_CLASS,
);

/** A ruled list row with a dot: filled ink for what is allowed, a hollow ring for what is not. */
export const PRESS_RULED_ROW_CLASS =
    "grid grid-cols-[14px_minmax(0,1fr)] items-baseline gap-3 border-t border-line py-4 text-body leading-[1.55]";
