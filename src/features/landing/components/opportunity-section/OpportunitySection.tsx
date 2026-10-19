import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import { NAV_FOCUS_CLASS } from "@/features/app-shell/components/navigation/navigationConfig.ts";
import { LandingSection } from "@/features/landing/components/common/LandingSection.tsx";
import {
    HEADLINE_COMPONENTS,
    SectionHeading,
} from "@/features/landing/components/common/SectionHeading.tsx";
import { HERO_SEARCH_ID } from "@/features/landing/components/hero-section/HeroSearch.tsx";
import { LANDING_PAGE_FRAGMENTS } from "@/features/landing/config/landingPageFragments.ts";
import { cn } from "@/lib/utils.ts";

/** Shares of 2025 art & antiques sales (Art Basel / UBS), oxblood → brass → sand. */
const MARKET_SEGMENTS = [
    { key: "dealer", share: 58.3, color: "bg-oxblood", rule: "border-oxblood" },
    { key: "publicAuction", share: 34.7, color: "bg-brass", rule: "border-brass" },
    { key: "privateAuction", share: 7, color: "bg-sand", rule: "border-sand" },
] as const;

const STRONG_COMPONENTS = { strong: <strong className="font-semibold text-ink" /> };

function MarketFigure() {
    const { t } = useTranslation();

    return (
        <figure
            data-theme="light"
            className="flex flex-col gap-5 rounded-figure bg-surface-raised p-[22px] text-ink shadow-ring sm:gap-[26px] sm:p-[clamp(24px,3vw,40px)]"
        >
            <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
                <div className="flex flex-col gap-3">
                    <span className="font-mono text-[10px] tracking-[0.14em] text-ink-muted uppercase sm:text-label">
                        {t("landingPage.opportunity.market.label")}
                    </span>
                    <span className="font-serif text-[60px] leading-none sm:text-display-figure">
                        {t("landingPage.opportunity.market.value")}
                    </span>
                </div>
                <span className="text-sm text-ink-secondary">
                    <Trans
                        i18nKey="landingPage.opportunity.market.transactions"
                        components={STRONG_COMPONENTS}
                    />
                </span>
            </div>
            <div
                aria-hidden="true"
                className="flex h-9 gap-[3px] overflow-hidden rounded-thumb sm:h-11"
            >
                {MARKET_SEGMENTS.map((segment) => (
                    <div
                        key={segment.key}
                        className={segment.color}
                        style={{ width: `${segment.share}%` }}
                    />
                ))}
            </div>
            <dl className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-3 sm:gap-[18px]">
                {MARKET_SEGMENTS.map((segment) => (
                    <div
                        key={segment.key}
                        className={cn("flex flex-col gap-1 border-t-[3px] pt-3", segment.rule)}
                    >
                        <dt className="order-2 text-meta text-ink-secondary">
                            {t(`landingPage.opportunity.market.segments.${segment.key}.label`)}
                        </dt>
                        <dd className="order-1 font-serif text-[30px] leading-tight">
                            {t(`landingPage.opportunity.market.segments.${segment.key}.value`)}
                        </dd>
                    </div>
                ))}
            </dl>
            <figcaption className="flex flex-wrap justify-between gap-x-4 gap-y-2.5 border-t border-line-subtle pt-[18px] text-sm leading-normal text-ink-secondary">
                <span className="max-w-[420px]">
                    <Trans
                        i18nKey="landingPage.opportunity.market.caption"
                        components={STRONG_COMPONENTS}
                    />
                </span>
                <span className="font-mono text-[10px] tracking-[0.1em] text-ink-muted uppercase sm:text-[11px]">
                    {t("landingPage.opportunity.market.source")}
                </span>
            </figcaption>
        </figure>
    );
}

function SellersFigure() {
    const { t } = useTranslation();

    return (
        <figure className="grid grid-cols-1 items-end gap-4 rounded-figure bg-surface-raised p-[22px] text-ink shadow-ring sm:grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] sm:gap-6 sm:p-[clamp(24px,3vw,40px)]">
            <div className="flex flex-col gap-1.5">
                <span className="font-serif text-[52px] leading-none sm:text-[clamp(48px,5vw,68px)]">
                    {t("landingPage.opportunity.sellers.value")}
                </span>
                <span className="font-mono text-[10px] tracking-[0.14em] text-ink-muted uppercase sm:text-label">
                    {t("landingPage.opportunity.sellers.label")}
                </span>
            </div>
            <figcaption className="flex flex-col gap-2.5 text-sm leading-[1.55] text-ink-secondary">
                <span>{t("landingPage.opportunity.sellers.caption")}</span>
                <span className="font-mono text-[10px] tracking-[0.1em] text-ink-muted uppercase sm:text-[11px]">
                    {t("landingPage.opportunity.sellers.source")}
                </span>
            </figcaption>
        </figure>
    );
}

/** II — The opportunity: the size of the market and how fragmented it is, with sources. */
export function OpportunitySection() {
    const { t } = useTranslation();

    return (
        <LandingSection
            ground="ink"
            id={LANDING_PAGE_FRAGMENTS.opportunity}
            labelledBy="opportunity-heading"
            containerClassName="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-[clamp(48px,6vw,96px)]"
        >
            <div className="flex flex-col gap-7">
                <SectionHeading
                    id="opportunity-heading"
                    onInk
                    eyebrow={t("landingPage.opportunity.eyebrow")}
                    title={
                        <Trans
                            i18nKey="landingPage.opportunity.title"
                            components={HEADLINE_COMPONENTS}
                        />
                    }
                    intro={t("landingPage.opportunity.body")}
                />
                <Link
                    to="/$lng"
                    hash={HERO_SEARCH_ID}
                    params={true}
                    from="/$lng"
                    data-theme="light"
                    className={cn(
                        "inline-flex h-13 items-center justify-center gap-2.5 rounded-pill bg-surface px-[22px] text-base font-medium text-ink transition-opacity hover:opacity-90 sm:h-12 sm:self-start sm:text-[15px]",
                        NAV_FOCUS_CLASS,
                    )}
                >
                    {t("landingPage.opportunity.cta")}
                    <ArrowRight aria-hidden="true" className="size-4" strokeWidth={1.8} />
                </Link>
            </div>
            <div className="flex flex-col gap-3 sm:gap-4">
                <MarketFigure />
                <SellersFigure />
            </div>
        </LandingSection>
    );
}
