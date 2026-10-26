import type { ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import { NAV_FOCUS_CLASS } from "@/features/app-shell/components/navigation/navigationConfig.ts";
import { LandingSection } from "@/features/landing/components/common/LandingSection.tsx";
import {
    HEADLINE_COMPONENTS,
    SectionHeading,
} from "@/features/landing/components/common/SectionHeading.tsx";
import {
    AgentDemo,
    AlertsDemo,
    LanguagesDemo,
    MarketWatchDemo,
    TimelineDemo,
    WatchlistDemo,
} from "@/features/landing/components/platform-section/PlatformDemos.tsx";
import { LANDING_PAGE_FRAGMENTS } from "@/features/landing/config/landingPageFragments.ts";
import { useMediaQuery } from "@/hooks/common/useMediaQuery.ts";
import { cn } from "@/lib/utils.ts";

/** Width from which the platform cards form the bento grid (matches `min-[920px]`). */
const BENTO_QUERY = "(min-width: 920px)";

interface FeatureCardProps {
    /** Translation prefix under `landingPage.platform`. */
    readonly feature: string;
    readonly demo: ReactNode;
    readonly className?: string;
}

/** A bento tile: mono kicker, serif promise, short description, and a working miniature. */
function FeatureCard({ feature, demo, className }: FeatureCardProps) {
    const { t } = useTranslation();

    return (
        <article
            className={cn(
                "flex flex-col gap-[18px] rounded-card bg-surface-raised p-[22px] shadow-ring sm:gap-[22px] sm:p-7",
                className,
            )}
        >
            <div className="flex flex-col gap-2 sm:gap-2.5">
                <span className="font-mono text-[10px] tracking-[0.16em] text-brass-ink uppercase sm:text-kicker">
                    {t(`landingPage.platform.${feature}.kicker`)}
                </span>
                <h3 className="font-serif text-2xl leading-[1.15] font-normal sm:text-title-md">
                    {t(`landingPage.platform.${feature}.title`)}
                </h3>
                <p className="text-body-sm text-ink-secondary">
                    {t(`landingPage.platform.${feature}.body`)}
                </p>
            </div>
            {demo}
        </article>
    );
}

/** III — The platform: search instructions (Ultimate), four everyday tools and market watch. */
export function PlatformSection() {
    const { t } = useTranslation();
    const isBento = useMediaQuery(BENTO_QUERY);
    // Phones scroll the tool cards sideways, so the row is a keyboard-focusable region there.
    const rowProps = isBento
        ? {}
        : {
              role: "region",
              "aria-label": t("landingPage.platform.moreToolsLabel"),
              tabIndex: 0,
          };

    return (
        <LandingSection
            ground="sunken"
            id={LANDING_PAGE_FRAGMENTS.platform}
            labelledBy="platform-heading"
            containerClassName="flex flex-col gap-8 sm:gap-14"
        >
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-[18px]">
                <SectionHeading
                    id="platform-heading"
                    className="max-w-[720px]"
                    eyebrow={t("landingPage.platform.eyebrow")}
                    title={
                        <Trans
                            i18nKey="landingPage.platform.title"
                            components={HEADLINE_COMPONENTS}
                        />
                    }
                />
                <p className="max-w-[420px] text-base leading-relaxed text-ink-secondary sm:text-[17px]">
                    {t("landingPage.platform.intro")}
                </p>
            </div>

            <div className="flex flex-col gap-3 min-[920px]:grid min-[920px]:grid-cols-6 min-[920px]:gap-4">
                <article
                    id={LANDING_PAGE_FRAGMENTS.agent}
                    data-theme="dark"
                    className="flex scroll-mt-16 flex-col gap-[22px] rounded-card bg-surface-raised p-[22px] text-ink sm:gap-7 sm:p-[clamp(24px,3vw,40px)] min-[920px]:col-span-4 min-[920px]:min-h-[440px]"
                >
                    <div className="flex max-w-[520px] flex-col gap-2.5 sm:gap-3">
                        <span className="font-mono text-[10px] tracking-[0.16em] text-brass uppercase sm:text-kicker">
                            {t("landingPage.platform.agent.kicker")}
                        </span>
                        <h3 className="font-serif text-[28px] leading-[1.12] font-normal sm:text-title-lg">
                            {t("landingPage.platform.agent.title")}
                        </h3>
                        <p className="text-body text-ink-secondary">
                            {t("landingPage.platform.agent.body")}
                        </p>
                    </div>
                    <AgentDemo />
                </article>

                <p className="mt-2 font-mono text-[10px] tracking-[0.16em] text-ink-muted uppercase min-[920px]:hidden">
                    {t("landingPage.platform.moreTools", { count: 4 })}
                </p>
                {/* A scrollable, focusable region on phones; from 920px its cards join the bento grid. */}
                <div
                    {...rowProps}
                    className={cn(
                        "-mx-(--page-gutter) flex snap-x snap-mandatory scroll-px-(--page-gutter) gap-3 overflow-x-auto px-(--page-gutter) pb-1 [scrollbar-width:none] min-[920px]:contents [&::-webkit-scrollbar]:hidden [&>article]:w-[290px] [&>article]:shrink-0 [&>article]:snap-start min-[920px]:[&>article]:col-span-2 min-[920px]:[&>article]:w-auto",
                        NAV_FOCUS_CLASS,
                    )}
                >
                    <FeatureCard feature="languages" demo={<LanguagesDemo />} />
                    <FeatureCard feature="alerts" demo={<AlertsDemo />} />
                    <FeatureCard feature="watchlist" demo={<WatchlistDemo />} />
                    <FeatureCard feature="timeline" demo={<TimelineDemo />} />
                </div>

                <article className="grid grid-cols-1 items-center gap-[22px] rounded-card bg-surface-raised p-[22px] shadow-ring sm:gap-10 sm:p-[clamp(24px,3vw,40px)] md:grid-cols-2 min-[920px]:col-span-6">
                    <div className="flex flex-col gap-2.5 sm:gap-3">
                        <span className="font-mono text-[10px] tracking-[0.16em] text-brass-ink uppercase sm:text-kicker">
                            {t("landingPage.platform.marketWatch.kicker")}
                        </span>
                        <h3 className="font-serif text-[28px] leading-[1.12] font-normal sm:text-title-lg">
                            {t("landingPage.platform.marketWatch.title")}
                        </h3>
                        <p className="max-w-[460px] text-body text-ink-secondary">
                            {t("landingPage.platform.marketWatch.body")}
                        </p>
                    </div>
                    <MarketWatchDemo />
                </article>
            </div>
        </LandingSection>
    );
}
