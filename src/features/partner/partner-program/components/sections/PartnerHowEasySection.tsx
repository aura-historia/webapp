import { ArrowRight } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import { NAV_FOCUS_CLASS } from "@/features/app-shell/components/navigation/navigationConfig.ts";
import { LandingSection } from "@/features/landing/components/common/LandingSection.tsx";
import {
    HEADLINE_COMPONENTS,
    SectionHeading,
} from "@/features/landing/components/common/SectionHeading.tsx";
import { PARTNER_PROGRAM_FRAGMENTS } from "@/features/partner/partner-program/config/partnerProgramFragments.ts";
import { cn } from "@/lib/utils.ts";

const STEPS = [
    { numeral: "I", key: "apply" },
    { numeral: "II", key: "claim" },
    { numeral: "III", key: "connect" },
] as const;

/** II — How it works: three Roman-numeral steps on the raised band, as on the landing page. */
export default function PartnerHowEasySection() {
    const { t } = useTranslation();

    return (
        <LandingSection
            ground="raised"
            id={PARTNER_PROGRAM_FRAGMENTS.howEasy}
            labelledBy="partner-how-easy-heading"
            containerClassName="flex flex-col gap-9 sm:gap-16"
        >
            <SectionHeading
                id="partner-how-easy-heading"
                align="center"
                eyebrow={`II — ${t("partnerProgram.howEasy.eyebrow")}`}
                title={
                    <Trans
                        i18nKey="partnerProgram.howEasy.title"
                        components={HEADLINE_COMPONENTS}
                    />
                }
                intro={t("partnerProgram.howEasy.subtitle")}
            />
            <ol className="grid grid-cols-1 sm:gap-y-10 md:grid-cols-3">
                {STEPS.map((step) => (
                    <li
                        key={step.key}
                        className="grid grid-cols-[56px_minmax(0,1fr)] gap-x-3 gap-y-1 border-t border-ink py-[22px] last:border-b md:flex md:flex-col md:gap-4 md:pt-7 md:pr-7 md:pb-0 md:last:border-b-0"
                    >
                        <span
                            aria-hidden="true"
                            className="row-span-2 font-serif text-[36px] leading-none text-oxblood md:text-display-rail md:leading-none"
                        >
                            {step.numeral}
                        </span>
                        <h3 className="font-serif text-[22px] font-medium md:text-title-sm">
                            {t(`partnerProgram.howEasy.steps.${step.key}.title`)}
                        </h3>
                        <p className="text-body text-ink-secondary">
                            {t(`partnerProgram.howEasy.steps.${step.key}.description`)}
                        </p>
                    </li>
                ))}
            </ol>
            <div className="flex sm:justify-center">
                <a
                    href={`#${PARTNER_PROGRAM_FRAGMENTS.apply}`}
                    className={cn(
                        "inline-flex h-[50px] w-full items-center justify-center gap-2.5 rounded-pill bg-ink px-6 text-[15px] font-medium text-surface transition-opacity hover:opacity-90 sm:w-auto",
                        NAV_FOCUS_CLASS,
                    )}
                >
                    {t("partnerProgram.howEasy.cta")}
                    <ArrowRight aria-hidden="true" className="size-4" strokeWidth={1.8} />
                </a>
            </div>
        </LandingSection>
    );
}
