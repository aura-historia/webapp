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
            id={id}
            aria-labelledby={labelledBy}
            data-theme={isDark ? "dark" : undefined}
            className={cn(
                "scroll-mt-16 px-(--page-gutter) py-[clamp(72px,10vw,140px)] text-ink",
                GROUND_CLASS[ground],
                className,
            )}
        >
            <div className={cn("mx-auto w-full max-w-content", containerClassName)}>{children}</div>
        </section>
    );
}
