import { Trans, useTranslation } from "react-i18next";

import {
    COMPARISON_SPLIT_CLASS,
    ComparisonHeading,
    ComparisonSection,
} from "@/features/comparison/components/ComparisonLayout.tsx";
import type { ComparisonDefinition } from "@/features/comparison/config/comparisonDefinition.ts";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { cn } from "@/lib/utils.ts";

/** I — Summary on parchment: the heading beside the serif answer and its supporting line. */
export function ComparisonSummarySection({
    definition,
}: {
    readonly definition: ComparisonDefinition;
}) {
    const { t } = useTranslation();
    const ns = definition.namespace;

    return (
        <ComparisonSection
            id="summary"
            labelledBy="comparison-summary-heading"
            ground="parchment"
            containerClassName={cn(COMPARISON_SPLIT_CLASS, "items-start")}
        >
            <ComparisonHeading id="comparison-summary-heading" size="lg">
                <Trans i18nKey={`${ns}.summary.title`} components={HEADLINE_COMPONENTS} />
            </ComparisonHeading>
            <div className="flex flex-col gap-5 border-t border-ink pt-5 sm:gap-7 sm:pt-7">
                <p className="font-serif text-[22px] leading-[1.32] tracking-[-0.005em] text-pretty sm:text-[clamp(24px,2.2vw,32px)] sm:leading-[1.3]">
                    {t(`${ns}.summary.paragraph1`)}
                </p>
                <p className="max-w-[640px] text-base leading-[1.6] text-ink-secondary sm:text-body-lg">
                    {t(`${ns}.summary.paragraph2`)}
                </p>
            </div>
        </ComparisonSection>
    );
}

/** II — Respect on the raised band: a centred heading over two columns of copy. */
export function ComparisonRespectSection({
    definition,
}: {
    readonly definition: ComparisonDefinition;
}) {
    const { t } = useTranslation();
    const ns = definition.namespace;

    return (
        <ComparisonSection
            id="respect"
            labelledBy="comparison-respect-heading"
            ground="raised"
            containerClassName="flex max-w-[1080px] flex-col gap-5 sm:gap-14"
        >
            <ComparisonHeading
                id="comparison-respect-heading"
                size="lg"
                className="sm:mx-auto sm:max-w-[900px] sm:text-center"
            >
                <Trans i18nKey={`${ns}.respect.title`} components={HEADLINE_COMPONENTS} />
            </ComparisonHeading>
            <div className="grid gap-4 border-t border-line pt-5 text-base leading-[1.65] text-ink-secondary sm:gap-[clamp(32px,4vw,64px)] sm:pt-9 sm:text-body-lg sm:leading-[1.65] min-[720px]:grid-cols-2">
                <p>{t(`${ns}.respect.paragraph1`)}</p>
                <p>{t(`${ns}.respect.paragraph2`)}</p>
            </div>
            {definition.statusNote && (
                <p className="flex flex-col gap-2 border-t border-line pt-5 text-body-sm text-ink-secondary sm:flex-row sm:gap-6 sm:pt-6">
                    <span className="shrink-0 font-mono text-label tracking-[0.14em] text-brass-ink uppercase sm:pt-0.5">
                        {t("comparison.statusLabel")}
                    </span>
                    <span>{t(`${ns}.respect.status`)}</span>
                </p>
            )}
        </ComparisonSection>
    );
}

/** III — Advantages on ink: four numbered, ruled columns (two from 720px, four from 1080px). */
export function ComparisonAdvantagesSection({
    definition,
}: {
    readonly definition: ComparisonDefinition;
}) {
    const { t } = useTranslation();
    const ns = definition.namespace;

    return (
        <ComparisonSection
            id="advantages"
            labelledBy="comparison-advantages-heading"
            ground="ink"
            containerClassName="flex flex-col gap-8 sm:gap-16"
        >
            <div className={cn(COMPARISON_SPLIT_CLASS, "items-end")}>
                <ComparisonHeading id="comparison-advantages-heading" onDark>
                    <Trans i18nKey={`${ns}.advantages.title`} components={HEADLINE_COMPONENTS} />
                </ComparisonHeading>
                <p className="max-w-[540px] text-base leading-[1.6] text-ink-secondary sm:text-body-lg">
                    {t(`${ns}.advantages.description`)}
                </p>
            </div>
            <ol className="grid grid-cols-1 min-[720px]:grid-cols-2 min-[720px]:gap-x-7 min-[720px]:gap-y-12 min-[1080px]:grid-cols-4">
                {definition.advantages.map(({ key, icon: Icon }, index) => {
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
                                {t(`${ns}.advantages.cards.${key}.title`)}
                            </h3>
                            <p className="text-body text-ink-secondary">
                                {t(`${ns}.advantages.cards.${key}.description`)}
                            </p>
                        </li>
                    );
                })}
            </ol>
        </ComparisonSection>
    );
}
