import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";

import type { ComparisonDefinition } from "@/features/comparison/config/comparisonDefinition.ts";
import { COMPARISON_REGISTRY } from "@/features/comparison/config/comparisonRegistry.ts";
import { NAV_FOCUS_CLASS } from "@/features/app-shell/components/navigation/navigationConfig.ts";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { cn } from "@/lib/utils.ts";

interface ComparisonOtherComparisonsSectionProps {
    /** The page showing the block; it is left out of the list. */
    readonly currentSlug: string;
    readonly registry?: readonly ComparisonDefinition[];
}

/**
 * A quiet parchment band after the verdict: crawlable internal links to the other published
 * comparisons, each with its name and one neutral line. Renders nothing when there are none.
 */
export function ComparisonOtherComparisonsSection({
    currentSlug,
    registry = COMPARISON_REGISTRY,
}: ComparisonOtherComparisonsSectionProps) {
    const { t } = useTranslation();
    const others = registry.filter((entry) => entry.slug !== currentSlug);

    if (others.length === 0) return null;

    return (
        <section
            id="other-comparisons"
            aria-labelledby="comparison-other-heading"
            className="bg-surface px-(--page-gutter) pt-12 pb-14 text-ink sm:pt-[clamp(48px,6vw,80px)] sm:pb-[clamp(56px,7vw,96px)]"
        >
            <div className="mx-auto flex w-full max-w-content flex-col gap-5 sm:gap-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                    <h2
                        id="comparison-other-heading"
                        className="font-serif text-[26px] leading-[1.15] font-normal tracking-[-0.01em] sm:text-[clamp(26px,2.4vw,32px)] [&_em]:italic"
                    >
                        <Trans
                            i18nKey="comparison.otherComparisons.title"
                            components={HEADLINE_COMPONENTS}
                        />
                    </h2>
                    <p className="text-body-sm text-ink-muted">
                        {t("comparison.otherComparisons.description")}
                    </p>
                </div>
                <ul className="grid grid-cols-1 border-t border-ink min-[720px]:grid-cols-2 min-[720px]:gap-x-7 min-[1080px]:grid-cols-3">
                    {others.map((entry) => (
                        <li key={entry.slug} className="border-b border-line">
                            <Link
                                to={entry.routePath}
                                params={true}
                                from="/$lng"
                                className={cn(
                                    "group flex min-h-11 items-start justify-between gap-4 py-[18px]",
                                    NAV_FOCUS_CLASS,
                                )}
                            >
                                <span className="flex flex-col gap-1.5">
                                    <span className="self-start font-serif text-[20px] leading-[1.25] group-hover:shadow-[inset_0_-1px_0_var(--ink)]">
                                        {t("comparison.otherComparisons.linkTitle", {
                                            name: entry.competitorName,
                                        })}
                                    </span>
                                    <span className="text-body-sm text-ink-secondary">
                                        {t(entry.positioningKey)}
                                    </span>
                                </span>
                                <ArrowRight
                                    className="mt-[5px] size-4 shrink-0 text-ink-muted transition-colors group-hover:text-ink"
                                    strokeWidth={1.8}
                                    aria-hidden="true"
                                />
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
