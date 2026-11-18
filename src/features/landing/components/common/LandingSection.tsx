import type { ReactNode } from "react";
import { cn } from "@/lib/utils.ts";

export type LandingGround = "surface" | "raised" | "sunken" | "ink" | "oxblood";

const GROUND_CLASS: Record<LandingGround, string> = {
    surface: "bg-surface",
    raised: "bg-surface-raised",
    sunken: "bg-surface-sunken",
    ink: "bg-surface",
    oxblood: "bg-oxblood",
};

interface LandingSectionProps {
    /** The section's ground; `ink` and `oxblood` switch everything inside to the dark theme. */
    readonly ground: LandingGround;
    /**
     * Fragment id. It sits on the content column, not the section, so a link to it brings the
     * section's title (not its top padding) to the top of the viewport, below the sticky header.
     */
    readonly id?: string;
    readonly labelledBy?: string;
    readonly className?: string;
    readonly containerClassName?: string;
    readonly children: ReactNode;
}

/** A landing-page chapter: full-bleed ground, page gutter, section padding and the content column. */
export function LandingSection({
    ground,
    id,
    labelledBy,
    className,
    containerClassName,
    children,
}: LandingSectionProps) {
    const isDark = ground === "ink" || ground === "oxblood";

    return (
        <section
            aria-labelledby={labelledBy}
            data-theme={isDark ? "dark" : undefined}
            className={cn(
                "px-(--page-gutter) py-[clamp(72px,10vw,140px)] text-ink",
                GROUND_CLASS[ground],
                className,
            )}
        >
            <div
                id={id}
                className={cn(
                    "mx-auto w-full max-w-content scroll-mt-(--anchor-offset)",
                    containerClassName,
                )}
            >
                {children}
            </div>
        </section>
    );
}
