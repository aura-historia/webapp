import { NAV_FOCUS_CLASS } from "@/features/app-shell/components/navigation/navigationConfig.ts";
import { cn } from "@/lib/utils.ts";

/** A 44px secondary pill: hairline ring, ink ring on hover, brass focus ring. */
export const OUTLINE_PILL_BUTTON_CLASS = cn(
    "inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-pill px-[18px] text-sm font-medium text-ink shadow-[inset_0_0_0_1px_var(--line-strong)] transition-shadow hover:shadow-[inset_0_0_0_1px_var(--ink)]",
    NAV_FOCUS_CLASS,
);
