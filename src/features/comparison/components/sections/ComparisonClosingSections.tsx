import { Bell, Clock, Globe, SearchCheck, Telescope } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";

import {
    COMPARISON_SCROLL_MARGIN_CLASS,
    COMPARISON_SPLIT_CLASS,
    ComparisonHeading,
    ComparisonSection,
    SearchMarketLink,
} from "@/features/comparison/components/ComparisonLayout.tsx";
import {
    BARNEBYS_COMPARISON_SECTION_IDS,
    BARNEBYS_DOWNSTREAM_KEYS,
    BARNEBYS_FAQ_ITEMS,
    BARNEBYS_SOURCE_KEYS,
} from "@/features/comparison/config/barnebysComparison.data.ts";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { cn } from "@/lib/utils.ts";

const DOWNSTREAM_ICONS = {
    underRadarInventory: Telescope,
    realMarket: SearchCheck,
    beforeDigest: Clock,
    acrossBorders: Globe,
} as const;

function toNumber(index: number) {
    return String(index + 1).padStart(2, "0");
}

/** V — Source coverage on the raised band: the ruled source list beside four outcome cards. */
export function ComparisonSourcesSection() {
    const { t } = useTranslation();

    return (
        <ComparisonSection
            id={BARNEBYS_COMPARISON_SECTION_IDS.sources}
            labelledBy="comparison-sources-heading"
            ground="raised"
            containerClassName={cn(COMPARISON_SPLIT_CLASS, "items-start")}
        >
            <div className="flex flex-col gap-5 sm:gap-6">
                <ComparisonHeading id="comparison-sources-heading" size="sm">
                    <Trans
                        i18nKey="compareBarnebysPage.downstream.title"
                        components={HEADLINE_COMPONENTS}
                    />
                </ComparisonHeading>
                <ul
                    aria-label={t("compareBarnebysPage.downstream.sourcesLabel")}
                    className="flex flex-col border-t border-ink sm:mt-3"
                >
                    {BARNEBYS_SOURCE_KEYS.map((key, index) => (
                        <li
                            key={key}
                            className="flex items-center justify-between gap-4 border-b border-line py-3 sm:py-3.5"
                        >
                            <span className="font-serif text-[19px] leading-[1.2] sm:text-[20px]">
                                {t(`compareBarnebysPage.downstream.sources.${key}`)}
                            </span>
                            <span
                                aria-hidden="true"
                                className="font-mono text-label text-ink-muted"
                            >
                                {toNumber(index)}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:mt-0 sm:gap-4 min-[720px]:grid-cols-2">
                {BARNEBYS_DOWNSTREAM_KEYS.map((key) => {
                    const Icon = DOWNSTREAM_ICONS[key];

                    return (
                        <article
                            key={key}
                            className="flex flex-col gap-3 rounded-card bg-surface px-5 py-[22px] shadow-ring sm:gap-3.5 sm:p-7"
                        >
                            <span className="flex size-11 items-center justify-center rounded-full bg-surface-sunken text-oxblood">
                                <Icon className="size-5" strokeWidth={1.6} aria-hidden="true" />
                            </span>
                            <h3 className="font-serif text-[22px] leading-[1.2] font-normal sm:text-[24px]">
                                {t(`compareBarnebysPage.downstream.cards.${key}.title`)}
                            </h3>
                            <p className="text-body-sm text-ink-secondary">
                                {t(`compareBarnebysPage.downstream.cards.${key}.description`)}
                            </p>
                        </article>
                    );
                })}
            </div>
        </ComparisonSection>
    );
}

/** VI — Alerts on parchment: one narrow column, the Aura Historia standard set in full ink. */
export function ComparisonAlertsSection() {
    const { t } = useTranslation();

    return (
        <ComparisonSection
            id={BARNEBYS_COMPARISON_SECTION_IDS.alerts}
            labelledBy="comparison-alerts-heading"
            ground="parchment"
            containerClassName="flex max-w-[920px] flex-col gap-5 sm:gap-9"
        >
            <span className="flex size-11 items-center justify-center rounded-full bg-oxblood text-on-oxblood sm:size-12">
                <Bell className="size-[18px] sm:size-5" strokeWidth={1.7} aria-hidden="true" />
            </span>
            <ComparisonHeading id="comparison-alerts-heading">
                <Trans
                    i18nKey="compareBarnebysPage.alerts.title"
                    components={HEADLINE_COMPONENTS}
                />
            </ComparisonHeading>
            <div className="flex flex-col gap-4 border-t border-ink pt-5 text-base leading-[1.65] sm:gap-5 sm:pt-7 sm:text-body-lg sm:leading-[1.65]">
                <p className="text-ink-secondary">{t("compareBarnebysPage.alerts.paragraph1")}</p>
                <p>{t("compareBarnebysPage.alerts.paragraph2")}</p>
            </div>
        </ComparisonSection>
    );
}

/** VII — Questions on the raised band: numbered, ruled items; every answer stays visible. */
export function ComparisonFaqSection() {
    const { t } = useTranslation();

    return (
        <ComparisonSection
            id={BARNEBYS_COMPARISON_SECTION_IDS.faq}
            labelledBy="comparison-faq-heading"
            ground="raised"
            containerClassName={cn(COMPARISON_SPLIT_CLASS, "items-start")}
        >
            <ComparisonHeading id="comparison-faq-heading" size="sm">
                <Trans i18nKey="compareBarnebysPage.faq.title" components={HEADLINE_COMPONENTS} />
            </ComparisonHeading>
            <ol className="mt-2 border-t border-ink sm:mt-0">
                {BARNEBYS_FAQ_ITEMS.map((item, index) => (
                    <li
                        key={item.key}
                        id={item.anchor}
                        className={cn(
                            "flex flex-col gap-2.5 border-b border-line py-[22px] sm:grid sm:grid-cols-[48px_minmax(0,1fr)] sm:gap-x-4 sm:gap-y-2 sm:py-7",
                            COMPARISON_SCROLL_MARGIN_CLASS,
                        )}
                    >
                        <span
                            aria-hidden="true"
                            className="font-mono text-label text-brass-ink sm:row-span-2 sm:pt-1.5 sm:text-eyebrow sm:tracking-[0.14em]"
                        >
                            {toNumber(index)}
                        </span>
                        <h3 className="font-serif text-[21px] leading-[1.28] font-normal sm:text-[24px] sm:leading-[1.25]">
                            {t(`compareBarnebysPage.faq.items.${item.key}.question`)}
                        </h3>
                        <p className="max-w-[680px] text-[15px] leading-[1.65] text-ink-secondary sm:text-base">
                            {t(`compareBarnebysPage.faq.items.${item.key}.answer`)}
                        </p>
                    </li>
                ))}
            </ol>
        </ComparisonSection>
    );
}

/** Final verdict on oxblood: the closing claim and the call to search. */
export function ComparisonVerdictSection() {
    const { t } = useTranslation();

    return (
        <ComparisonSection
            id={BARNEBYS_COMPARISON_SECTION_IDS.verdict}
            labelledBy="comparison-verdict-heading"
            ground="oxblood"
            className="pb-[72px] sm:py-[clamp(72px,9vw,120px)]"
            containerClassName="grid grid-cols-[repeat(auto-fit,minmax(min(440px,100%),1fr))] items-end gap-7 sm:gap-12"
        >
            <div className="flex flex-col gap-5 sm:gap-[22px]">
                <ComparisonHeading id="comparison-verdict-heading" size="verdict" onDark>
                    <Trans
                        i18nKey="compareBarnebysPage.finalCta.title"
                        components={HEADLINE_COMPONENTS}
                    />
                </ComparisonHeading>
                <p className="max-w-[520px] text-base leading-[1.6] text-on-oxblood-muted sm:text-[17px]">
                    {t("compareBarnebysPage.finalCta.description")}
                </p>
            </div>
            <div className="flex sm:justify-end">
                <SearchMarketLink className="h-[52px] w-full px-7 sm:h-[54px] sm:w-auto">
                    {t("compareBarnebysPage.finalCta.button")}
                </SearchMarketLink>
            </div>
        </ComparisonSection>
    );
}
