import { Sparkle } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";

import {
    COMPARISON_SCROLL_MARGIN_CLASS,
    SearchMarketLink,
    WinnerBadge,
} from "@/features/comparison/components/ComparisonLayout.tsx";
import {
    BARNEBYS_COMPARISON_SECTION_IDS,
    BARNEBYS_QUICK_VERDICTS,
} from "@/features/comparison/config/barnebysComparison.data.ts";
import { BARNEBYS_COMPARISON_LAST_REVIEWED } from "@/features/comparison/config/barnebysComparisonReview.ts";
import { NAV_FOCUS_CLASS } from "@/features/app-shell/components/navigation/navigationConfig.ts";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { cn } from "@/lib/utils.ts";

const GRID_COLUMNS = Array.from({ length: 12 }, (_, index) => index);
const STRONG_COMPONENTS = { strong: <strong className="font-semibold text-ink" /> };

/**
 * Formats the fixed review date in the page language. UTC keeps server and browser on the same
 * calendar day, so the markup hydrates unchanged.
 */
function formatReviewDate(isoDate: string, language: string): string {
    return new Intl.DateTimeFormat(language, {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    }).format(new Date(`${isoDate}T00:00:00Z`));
}

/** Ink hero: headline, lead, the two calls to action, the review date and the quick answer. */
export function ComparisonHeroSection() {
    const { t, i18n } = useTranslation();
    const reviewDate = formatReviewDate(
        BARNEBYS_COMPARISON_LAST_REVIEWED,
        i18n.resolvedLanguage ?? i18n.language,
    );

    return (
        <header data-theme="dark" className="relative overflow-hidden bg-surface text-ink">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 mx-auto hidden max-w-content grid-cols-12 sm:grid"
            >
                {GRID_COLUMNS.map((column) => (
                    <div
                        key={column}
                        className="border-l border-[rgba(244,238,227,0.045)] last:border-r"
                    />
                ))}
            </div>

            <div className="relative mx-auto grid w-full max-w-content gap-9 px-(--page-gutter) pt-14 pb-10 sm:pt-[clamp(72px,9vw,128px)] sm:pb-[clamp(72px,8vw,112px)] min-[1080px]:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] min-[1080px]:items-center min-[1080px]:gap-[clamp(48px,6vw,96px)]">
                <div className="flex flex-col gap-5 sm:gap-7">
                    <p className="font-mono text-[11px] tracking-[0.18em] text-brass-light uppercase sm:text-eyebrow">
                        {t("compareBarnebysPage.hero.eyebrow")}
                    </p>
                    <h1 className="font-serif text-[42px] leading-[1.02] font-normal tracking-[-0.025em] text-balance sm:text-[clamp(46px,6vw,88px)] sm:leading-none [&_em]:text-brass-light [&_em]:italic">
                        <Trans
                            i18nKey="compareBarnebysPage.hero.title"
                            components={HEADLINE_COMPONENTS}
                        />
                    </h1>
                    <p className="max-w-[620px] text-base leading-[1.55] text-pretty text-ink-secondary sm:text-lead">
                        {t("compareBarnebysPage.hero.subtitle")}
                    </p>
                    <div className="mt-1 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3">
                        <SearchMarketLink className="h-[50px]">
                            {t("compareBarnebysPage.hero.primaryCta")}
                        </SearchMarketLink>
                        <a
                            href={`#${BARNEBYS_COMPARISON_SECTION_IDS.scorecard}`}
                            className={cn(
                                "inline-flex h-[50px] items-center justify-center rounded-pill px-6 text-[15px] text-ink shadow-[inset_0_0_0_1px_var(--line-strong)] transition-shadow hover:shadow-[inset_0_0_0_1px_var(--ink)]",
                                NAV_FOCUS_CLASS,
                            )}
                        >
                            {t("compareBarnebysPage.hero.secondaryCta")}
                        </a>
                    </div>
                    <p className="font-mono text-[10.5px] tracking-[0.14em] text-ink-muted uppercase sm:text-[11px]">
                        <Trans
                            i18nKey="compareBarnebysPage.lastReviewed"
                            values={{ date: reviewDate }}
                            components={{
                                time: <time dateTime={BARNEBYS_COMPARISON_LAST_REVIEWED} />,
                            }}
                        />
                    </p>
                </div>

                <QuickAnswer />
            </div>
        </header>
    );
}

/** The quick answer is a section, not an aside, so extractors read it as main content. */
function QuickAnswer() {
    const { t } = useTranslation();

    return (
        <section
            id="quick-answer"
            aria-labelledby="comparison-quick-answer-heading"
            data-theme="light"
            className={cn(
                "flex flex-col gap-5 rounded-panel bg-surface-raised px-5 py-[22px] text-ink shadow-search sm:gap-6 sm:p-[clamp(24px,2.6vw,36px)]",
                COMPARISON_SCROLL_MARGIN_CLASS,
            )}
        >
            <div className="flex flex-col gap-3 sm:gap-3.5">
                <p className="inline-flex items-center gap-2 font-mono text-kicker text-brass-ink uppercase sm:gap-2.5">
                    <Sparkle className="size-4 shrink-0" strokeWidth={1.6} aria-hidden="true" />
                    {t("compareBarnebysPage.hero.quickAnswerEyebrow")}
                </p>
                <h2
                    id="comparison-quick-answer-heading"
                    className="font-serif text-[26px] leading-[1.15] font-normal tracking-[-0.01em] text-balance sm:text-[30px] [&_em]:italic"
                >
                    <Trans
                        i18nKey="compareBarnebysPage.hero.quickAnswerTitle"
                        components={HEADLINE_COMPONENTS}
                    />
                </h2>
            </div>
            <dl className="border-t border-ink">
                {BARNEBYS_QUICK_VERDICTS.map((verdict) => (
                    <div
                        key={verdict.key}
                        className="flex flex-col items-start gap-2 border-b border-line py-3.5 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4"
                    >
                        <dt className="text-body-sm leading-[1.45] text-ink-secondary">
                            {t(`compareBarnebysPage.quickVerdicts.${verdict.key}.label`)}
                        </dt>
                        <dd>
                            <WinnerBadge winner={verdict.winner}>
                                {t(`compareBarnebysPage.quickVerdicts.${verdict.key}.value`)}
                            </WinnerBadge>
                        </dd>
                    </div>
                ))}
            </dl>
            <p className="text-body-sm text-ink-secondary">
                <Trans
                    i18nKey="compareBarnebysPage.hero.quickAnswerDescription"
                    components={STRONG_COMPONENTS}
                />
            </p>
        </section>
    );
}
