import { Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import type { ReactNode } from "react";

import type { ComparisonWinner } from "@/features/comparison/config/barnebysComparison.data.ts";
import { NAV_FOCUS_CLASS } from "@/features/app-shell/components/navigation/navigationConfig.ts";
import { HERO_SEARCH_ID } from "@/features/landing/components/hero-section/HeroSearch.tsx";
import { cn } from "@/lib/utils.ts";

/** Anchored chapters clear the sticky header (60px phones) and, from 640px, the jump-link bar. */
export const COMPARISON_SCROLL_MARGIN_CLASS = "scroll-mt-[72px] sm:scroll-mt-[136px]";

/** A chapter opener split in two from 1080px: the heading on the left, its companion on the right. */
export const COMPARISON_SPLIT_CLASS =
    "grid grid-cols-1 gap-5 sm:gap-8 min-[1080px]:grid-cols-[minmax(min(380px,100%),0.8fr)_minmax(0,1.2fr)] min-[1080px]:gap-[clamp(40px,6vw,96px)]";

type ComparisonGround = "parchment" | "raised" | "ink" | "oxblood";

const GROUND_CLASS: Record<ComparisonGround, string> = {
    parchment: "bg-surface border-b border-line-subtle",
    raised: "bg-surface-raised",
    ink: "bg-surface",
    oxblood: "bg-oxblood",
};

interface ComparisonSectionProps {
    readonly id: string;
    readonly labelledBy: string;
    readonly ground: ComparisonGround;
    readonly className?: string;
    readonly containerClassName?: string;
    readonly children: ReactNode;
}

/** A comparison chapter: full-bleed ground, page gutter, chapter padding and the content column. */
export function ComparisonSection({
    id,
    labelledBy,
    ground,
    className,
    containerClassName,
    children,
}: ComparisonSectionProps) {
    const isDark = ground === "ink" || ground === "oxblood";

    return (
        <section
            id={id}
            aria-labelledby={labelledBy}
            data-theme={isDark ? "dark" : undefined}
            className={cn(
                "px-(--page-gutter) py-16 text-ink sm:py-[clamp(80px,10vw,140px)]",
                COMPARISON_SCROLL_MARGIN_CLASS,
                GROUND_CLASS[ground],
                className,
            )}
        >
            <div className={cn("mx-auto w-full max-w-content", containerClassName)}>{children}</div>
        </section>
    );
}

const HEADING_SIZE_CLASS = {
    /** The quieter chapters set at the section display size. */
    lg: "text-[38px] leading-[1.04] sm:text-display-section",
    md: "text-[36px] leading-[1.05] sm:text-[clamp(40px,4.6vw,64px)] sm:leading-[1.04]",
    sm: "text-[34px] leading-[1.06] sm:text-[clamp(40px,4.4vw,60px)] sm:leading-[1.04]",
    verdict: "text-[34px] leading-[1.06] sm:text-[clamp(36px,4.2vw,60px)] sm:leading-[1.05]",
} as const;

interface ComparisonHeadingProps {
    readonly id: string;
    readonly size?: keyof typeof HEADING_SIZE_CLASS;
    /** On the ink or oxblood ground the italic phrase is set in brass-light. */
    readonly onDark?: boolean;
    readonly className?: string;
    readonly children: ReactNode;
}

/** A chapter's serif h2; the closing phrase arrives in `<em>` from the translation. */
export function ComparisonHeading({
    id,
    size = "md",
    onDark = false,
    className,
    children,
}: ComparisonHeadingProps) {
    return (
        <h2
            id={id}
            className={cn(
                "font-serif font-normal tracking-[-0.02em] text-balance [&_em]:italic",
                HEADING_SIZE_CLASS[size],
                onDark && "[&_em]:text-brass-light",
                className,
            )}
        >
            {children}
        </h2>
    );
}

/** The verdict pill: oxblood with a check for Aura Historia, an outline for Barnebys. */
export function WinnerBadge({
    winner,
    children,
}: {
    readonly winner: ComparisonWinner;
    readonly children: ReactNode;
}) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1.5 font-mono text-[10.5px] leading-none tracking-[0.1em] whitespace-nowrap uppercase",
                winner === "aura"
                    ? "bg-oxblood text-on-oxblood"
                    : "text-ink shadow-[inset_0_0_0_1px_var(--line-strong)]",
            )}
        >
            {winner === "aura" && (
                <Check className="size-3 shrink-0" strokeWidth={2.4} aria-hidden="true" />
            )}
            {children}
        </span>
    );
}

/** The parchment pill that sends the reader to the landing search; used on ink and oxblood. */
export function SearchMarketLink({
    children,
    className,
}: {
    readonly children: ReactNode;
    readonly className?: string;
}) {
    return (
        <Link
            to="/$lng"
            hash={HERO_SEARCH_ID}
            params={true}
            from="/$lng"
            data-theme="light"
            className={cn(
                "inline-flex items-center justify-center gap-2.5 rounded-pill bg-surface px-6 text-[15px] font-medium text-ink transition-opacity hover:opacity-92",
                NAV_FOCUS_CLASS,
                className,
            )}
        >
            {children}
            <ArrowRight className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
        </Link>
    );
}
