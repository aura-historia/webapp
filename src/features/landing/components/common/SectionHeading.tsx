import type { ReactNode } from "react";
import { cn } from "@/lib/utils.ts";

/** Components for `<Trans>`: the closing phrase of a headline is wrapped in `<em>`. */
export const HEADLINE_COMPONENTS = { em: <em /> };

interface SectionHeadingProps {
    /** Mono eyebrow, e.g. "II — The opportunity"; it is uppercased. */
    readonly eyebrow: string;
    /** The headline; put its closing phrase in `<em>`. */
    readonly title: ReactNode;
    readonly intro?: ReactNode;
    readonly id?: string;
    /** `section` for chapter headlines, `rail` for the smaller headline above a carousel. */
    readonly size?: "section" | "rail";
    readonly align?: "start" | "center";
    /** On the ink or oxblood ground the italic phrase is set in brass-light. */
    readonly onInk?: boolean;
    readonly eyebrowClassName?: string;
    readonly className?: string;
}

/** The editorial opener of a landing chapter: mono eyebrow, serif headline, optional intro. */
export function SectionHeading({
    eyebrow,
    title,
    intro,
    id,
    size = "section",
    align = "start",
    onInk = false,
    eyebrowClassName,
    className,
}: SectionHeadingProps) {
    return (
        <div
            className={cn(
                "flex flex-col gap-4 sm:gap-6",
                align === "center" && "sm:items-center sm:text-center",
                className,
            )}
        >
            <p
                className={cn(
                    "font-mono text-[11px] tracking-[0.2em] text-brass-ink uppercase sm:text-eyebrow",
                    eyebrowClassName,
                )}
            >
                {eyebrow}
            </p>
            <h2
                id={id}
                className={cn(
                    "font-serif font-normal text-balance [&_em]:italic",
                    size === "section"
                        ? "text-[38px] leading-[1.04] tracking-[-0.02em] sm:text-display-section"
                        : "text-[36px] leading-[1.04] tracking-[-0.02em] sm:text-[clamp(36px,3.8vw,56px)]",
                    onInk && "[&_em]:text-brass-light",
                )}
            >
                {title}
            </h2>
            {intro && (
                <p className="max-w-[540px] text-base leading-relaxed text-pretty text-ink-secondary sm:text-body-lg">
                    {intro}
                </p>
            )}
        </div>
    );
}
