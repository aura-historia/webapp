import { Trans, useTranslation } from "react-i18next";
import { LandingSection } from "@/features/landing/components/common/LandingSection.tsx";
import {
    HEADLINE_COMPONENTS,
    SectionHeading,
} from "@/features/landing/components/common/SectionHeading.tsx";
import { HOW_IT_WORKS_STEPS } from "@/features/landing/components/how-it-works-section/HowItWorksSection.data.ts";
import { LANDING_PAGE_FRAGMENTS } from "@/features/landing/config/landingPageFragments.ts";

/** IV — How it works: Roman numerals in oxblood over short steps, each topped by an ink rule. */
export default function HowItWorksSection() {
    const { t } = useTranslation();

    return (
        <LandingSection
            ground="raised"
            id={LANDING_PAGE_FRAGMENTS.howItWorks}
            labelledBy="how-it-works-heading"
            containerClassName="flex flex-col gap-9 sm:gap-16"
        >
            <SectionHeading
                id="how-it-works-heading"
                align="center"
                className="sm:[&_h2]:max-w-[900px]"
                eyebrow={t("landingPage.howItWorks.eyebrow")}
                title={
                    <Trans
                        i18nKey="landingPage.howItWorks.title"
                        components={HEADLINE_COMPONENTS}
                    />
                }
            />
            <ol className="grid grid-cols-1 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-4">
                {HOW_IT_WORKS_STEPS.map((step) => (
                    <li
                        key={step.numeral}
                        className="grid grid-cols-[56px_minmax(0,1fr)] gap-x-3 gap-y-1 border-t border-ink py-[22px] last:border-b sm:flex sm:flex-col sm:gap-4 sm:pt-7 sm:pr-7 sm:pb-0 sm:last:border-b-0"
                    >
                        <span
                            aria-hidden="true"
                            className="row-span-2 font-serif text-[40px] leading-none text-oxblood sm:text-display-rail sm:leading-none"
                        >
                            {step.numeral}
                        </span>
                        <h3 className="font-serif text-[22px] font-medium sm:text-title-sm">
                            {t(step.titleKey)}
                        </h3>
                        <p className="text-body text-ink-secondary">{t(step.descKey)}</p>
                    </li>
                ))}
            </ol>
        </LandingSection>
    );
}
