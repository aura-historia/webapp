import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils.ts";

/**
 * Longer texts start clamped behind a "Show more" toggle. Decided from the text itself, not a
 * measurement, so the server and the first client render agree and nothing shifts after mount.
 */
const CLAMP_CHARACTERS = 420;
const CLAMP_PARAGRAPHS = 3;

function toParagraphs(description: string): string[] {
    return description
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);
}

export function ProductDescription({ description }: { readonly description: string }) {
    const { t } = useTranslation();
    const bodyId = useId();
    const [expanded, setExpanded] = useState(false);
    const paragraphs = toParagraphs(description);

    if (paragraphs.length === 0) return null;

    const clampable = description.length > CLAMP_CHARACTERS || paragraphs.length > CLAMP_PARAGRAPHS;
    const clamped = clampable && !expanded;

    return (
        <section aria-labelledby={`${bodyId}-title`} className="border-t border-line pt-7">
            <h2
                id={`${bodyId}-title`}
                className="mb-4 font-serif text-title-sm font-normal tracking-[-0.01em]"
            >
                {t("product.description.title")}
            </h2>
            <div id={bodyId} className={cn("relative", clamped && "max-h-[260px] overflow-hidden")}>
                <div className="flex flex-col gap-4 text-body leading-[1.7] whitespace-pre-line text-pretty text-ink-secondary">
                    {paragraphs.map((paragraph, index) => (
                        // Paragraphs have no identity beyond their position in the text.
                        // biome-ignore lint/suspicious/noArrayIndexKey: static text split
                        <p key={index}>{paragraph}</p>
                    ))}
                </div>
                {clamped && (
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-18 bg-gradient-to-b from-transparent to-surface"
                    />
                )}
            </div>
            {clampable && (
                <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={bodyId}
                    onClick={() => setExpanded((value) => !value)}
                    className="mt-3 inline-flex min-h-11 cursor-pointer items-center gap-1.5 text-body-sm font-medium underline decoration-line-strong underline-offset-3 outline-none hover:text-brass-ink focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass"
                >
                    {expanded
                        ? t("product.description.showLess")
                        : t("product.description.showMore")}
                    <ChevronDown
                        aria-hidden="true"
                        strokeWidth={1.8}
                        className={cn("size-3.5 transition-transform", expanded && "rotate-180")}
                    />
                </button>
            )}
        </section>
    );
}
