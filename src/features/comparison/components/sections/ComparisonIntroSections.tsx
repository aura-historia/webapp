import { Bell, Languages, Store, Sun } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";

import {
    COMPARISON_SPLIT_CLASS,
    ComparisonHeading,
    ComparisonSection,
} from "@/features/comparison/components/ComparisonLayout.tsx";
import {
    BARNEBYS_ADVANTAGE_KEYS,
    BARNEBYS_COMPARISON_SECTION_IDS,
} from "@/features/comparison/config/barnebysComparison.data.ts";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { cn } from "@/lib/utils.ts";

const ADVANTAGE_ICONS = {
    marketBeyondAuctions: Store,
    nearRealTimeAlerts: Bell,
    languagePenalties: Languages,
    aiForwardMatching: Sun,
} as const;

/** I — Summary on parchment: the heading beside the serif answer and its supporting line. */
export function ComparisonSummarySection() {
    const { t } = useTranslation();

    return (
        <ComparisonSection
            id={BARNEBYS_COMPARISON_SECTION_IDS.summary}
            labelledBy="comparison-summary-heading"
            ground="parchment"
            containerClassName={cn(COMPARISON_SPLIT_CLASS, "items-start")}
        >
            <ComparisonHeading id="comparison-summary-heading" size="lg">
                <Trans
                    i18nKey="compareBarnebysPage.summary.title"
                    components={HEADLINE_COMPONENTS}
                />
            </ComparisonHeading>
            <div className="flex flex-col gap-5 border-t border-ink pt-5 sm:gap-7 sm:pt-7">
                <p className="font-serif text-[22px] leading-[1.32] tracking-[-0.005em] text-pretty sm:text-[clamp(24px,2.2vw,32px)] sm:leading-[1.3]">
                    {t("compareBarnebysPage.summary.paragraph1")}
                </p>
                <p className="max-w-[640px] text-base leading-[1.6] text-ink-secondary sm:text-body-lg">
                    {t("compareBarnebysPage.summary.paragraph2")}
                </p>
            </div>
        </ComparisonSection>
    );
}

/** II — Respect on the raised band: a centred heading over two columns of copy. */
export function ComparisonRespectSection() {
    const { t } = useTranslation();

    return (
        <ComparisonSection
            id={BARNEBYS_COMPARISON_SECTION_IDS.respect}
            labelledBy="comparison-respect-heading"
            ground="raised"
            containerClassName="flex max-w-[1080px] flex-col gap-5 sm:gap-14"
        >
            <ComparisonHeading
                id="comparison-respect-heading"
                size="lg"
                className="sm:mx-auto sm:max-w-[900px] sm:text-center"
            >
                <Trans
                    i18nKey="compareBarnebysPage.respect.title"
                    components={HEADLINE_COMPONENTS}
                />
            </ComparisonHeading>
            <div className="grid gap-4 border-t border-line pt-5 text-base leading-[1.65] text-ink-secondary sm:gap-[clamp(32px,4vw,64px)] sm:pt-9 sm:text-body-lg sm:leading-[1.65] min-[720px]:grid-cols-2">
                <p>{t("compareBarnebysPage.respect.paragraph1")}</p>
                <p>{t("compareBarnebysPage.respect.paragraph2")}</p>
            </div>
        </ComparisonSection>
    );
}

/** III — Advantages on ink: four numbered, ruled columns (two from 720px, four from 1080px). */
export function ComparisonAdvantagesSection() {
    const { t } = useTranslation();

    return (
        <ComparisonSection
            id={BARNEBYS_COMPARISON_SECTION_IDS.advantages}
            labelledBy="comparison-advantages-heading"
            ground="ink"
            containerClassName="flex flex-col gap-8 sm:gap-16"
        >
            <div className={cn(COMPARISON_SPLIT_CLASS, "items-end")}>
                <ComparisonHeading id="comparison-advantages-heading" onDark>
                    <Trans
                        i18nKey="compareBarnebysPage.advantages.title"
                        components={HEADLINE_COMPONENTS}
                    />
                </ComparisonHeading>
                <p className="max-w-[540px] text-base leading-[1.6] text-ink-secondary sm:text-body-lg">
                    {t("compareBarnebysPage.advantages.description")}
                </p>
            </div>
            <ol className="grid grid-cols-1 min-[720px]:grid-cols-2 min-[720px]:gap-x-7 min-[720px]:gap-y-12 min-[1080px]:grid-cols-4">
                {BARNEBYS_ADVANTAGE_KEYS.map((key, index) => {
                    const Icon = ADVANTAGE_ICONS[key];

                    return (
                        <li
                            key={key}
                            className="flex flex-col gap-3 border-t border-ink pt-5 pb-8 last:pb-2 sm:gap-4 min-[720px]:pt-6 min-[720px]:pb-0 min-[720px]:last:pb-0"
                        >
                            <div className="flex items-center justify-between">
                                <span
                                    aria-hidden="true"
                                    className="font-mono text-eyebrow tracking-[0.14em] text-brass-ink"
                                >
                                    {String(index + 1).padStart(2, "0")}
                                </span>
                                <Icon
                                    className="size-6 text-brass-light"
                                    strokeWidth={1.5}
                                    aria-hidden="true"
                                />
                            </div>
                            <h3 className="font-serif text-[24px] leading-[1.15] font-normal sm:text-title-md">
                                {t(`compareBarnebysPage.advantages.cards.${key}.title`)}
                            </h3>
                            <p className="text-body text-ink-secondary">
                                {t(`compareBarnebysPage.advantages.cards.${key}.description`)}
                            </p>
                        </li>
                    );
                })}
            </ol>
        </ComparisonSection>
    );
}
