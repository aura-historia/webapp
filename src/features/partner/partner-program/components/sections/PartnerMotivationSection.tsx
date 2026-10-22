import { Trans, useTranslation } from "react-i18next";
import { LandingSection } from "@/features/landing/components/common/LandingSection.tsx";
import {
    HEADLINE_COMPONENTS,
    SectionHeading,
} from "@/features/landing/components/common/SectionHeading.tsx";
import { PARTNER_PROGRAM_FRAGMENTS } from "@/features/partner/partner-program/config/partnerProgramFragments.ts";

const MOTIVATION_ITEMS = [
    "audience",
    "traffic",
    "highIntent",
    "trust",
    "realtime",
    "noCommission",
] as const;

/** I — Why join: six reasons as numbered columns under ink rules. */
export default function PartnerMotivationSection() {
    const { t } = useTranslation();

    return (
        <LandingSection
            ground="surface"
            id={PARTNER_PROGRAM_FRAGMENTS.motivation}
            labelledBy="partner-motivation-heading"
            className="border-b border-line-subtle"
            containerClassName="flex flex-col gap-9 sm:gap-16"
        >
            <div className="grid items-end gap-4 sm:gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-[clamp(40px,6vw,96px)]">
                <SectionHeading
                    id="partner-motivation-heading"
                    eyebrow={`I — ${t("partnerProgram.motivation.eyebrow")}`}
                    title={
                        <Trans
                            i18nKey="partnerProgram.motivation.title"
                            components={HEADLINE_COMPONENTS}
                        />
                    }
                />
                <p className="max-w-[540px] text-base leading-relaxed text-pretty text-ink-secondary sm:text-body-lg">
                    {t("partnerProgram.motivation.subtitle")}
                </p>
            </div>
            <ol className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-7 lg:grid-cols-3">
                {MOTIVATION_ITEMS.map((item, index) => (
                    <li
                        key={item}
                        className="grid grid-cols-[36px_minmax(0,1fr)] gap-x-3 gap-y-1.5 border-t border-ink pt-5 pb-6 sm:flex sm:flex-col sm:gap-3 sm:pt-6 sm:pb-12"
                    >
                        <span
                            aria-hidden="true"
                            className="row-span-2 pt-1.5 font-mono text-xs tracking-[0.14em] text-brass-ink sm:pt-0"
                        >
                            {String(index + 1).padStart(2, "0")}
                        </span>
                        <h3 className="font-serif text-[22px] leading-[1.2] font-normal sm:text-title-md">
                            {t(`partnerProgram.motivation.items.${item}.title`)}
                        </h3>
                        <p className="max-w-[380px] text-body text-ink-secondary">
                            {t(`partnerProgram.motivation.items.${item}.description`)}
                        </p>
                    </li>
                ))}
            </ol>
        </LandingSection>
    );
}
