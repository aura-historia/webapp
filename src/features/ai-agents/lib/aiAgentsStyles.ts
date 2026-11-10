import { NAV_FOCUS_CLASS } from "@/features/app-shell/components/navigation/navigationConfig.ts";
import { cn } from "@/lib/utils.ts";

/** A chapter opener split in two from 1080px: the heading on the left, its companion on the right. */
export const AI_AGENTS_SPLIT_CLASS =
    "grid gap-4 sm:gap-6 min-[1080px]:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] min-[1080px]:gap-[clamp(40px,6vw,96px)]";

/** The intro paragraph beside a chapter heading. */
export const AI_AGENTS_INTRO_CLASS =
    "max-w-[540px] text-base leading-relaxed text-pretty text-ink-secondary sm:text-[17px]";

/** The mono label above a list or group. */
export const AI_AGENTS_LABEL_CLASS = "font-mono text-kicker font-normal text-ink-muted uppercase";

/** A secondary pill: hairline ring, ink ring on hover. */
export const AI_AGENTS_OUTLINE_BUTTON_CLASS = cn(
    "inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-pill px-[18px] text-sm font-medium text-ink shadow-[inset_0_0_0_1px_var(--line-strong)] transition-shadow hover:shadow-[inset_0_0_0_1px_var(--ink)]",
    NAV_FOCUS_CLASS,
);

/** The quiet text link that closes a chapter, with an arrow. */
export const AI_AGENTS_TEXT_LINK_CLASS = cn(
    "inline-flex min-h-11 items-center gap-2 self-start text-body-sm font-medium text-ink underline-offset-4 hover:underline",
    NAV_FOCUS_CLASS,
);

/** The dashed "in development" tag with a hollow mark. */
export const AI_AGENTS_DEV_TAG_CLASS =
    "inline-flex items-center gap-2 self-start rounded-sm border border-dashed border-line-strong px-2 py-1 font-mono text-tag tracking-[0.12em] whitespace-nowrap text-ink-secondary uppercase";
