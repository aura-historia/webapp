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

const STANDARDS = ["specialism", "descriptions", "business", "conduct"] as const;

const STEPS = [
    { numeral: "I", key: "submit" },
    { numeral: "II", key: "review" },
    { numeral: "III", key: "connect" },
] as const;

/**
 * III — Admission: the published standards under ink rules, then the path (apply, review, connect)
 * as Roman-numeral steps on the raised band. The review is the threshold; connecting stays easy.
 */
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
                eyebrow={`III — ${t("partnerProgram.howEasy.eyebrow")}`}
                title={
                    <Trans
                        i18nKey="partnerProgram.howEasy.title"
                        components={HEADLINE_COMPONENTS}
                    />
                }
                intro={t("partnerProgram.howEasy.subtitle")}
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-baseline sm:gap-x-6 sm:gap-y-5">
                <p
                    id="partner-standards-label"
                    className="font-mono text-kicker text-ink-muted uppercase sm:col-start-1 sm:row-start-1"
                >
                    {t("partnerProgram.howEasy.standards.label")}
                </p>
                <ol
                    aria-labelledby="partner-standards-label"
                    className="grid grid-cols-1 sm:col-span-2 sm:row-start-2 sm:grid-cols-2 sm:gap-x-7 lg:grid-cols-4"
                >
                    {STANDARDS.map((standard, index) => (
                        <li
                            key={standard}
                            className="grid grid-cols-[36px_minmax(0,1fr)] gap-x-3 gap-y-1.5 border-t border-ink pt-5 pb-[22px] sm:flex sm:flex-col sm:gap-2.5 sm:pt-6 sm:pb-2"
                        >
                            <span
                                aria-hidden="true"
                                className="row-span-2 pt-1.5 font-mono text-xs tracking-[0.14em] text-brass-ink sm:pt-0"
                            >
                                {String(index + 1).padStart(2, "0")}
                            </span>
                            <h3 className="font-serif text-[22px] leading-[1.2] font-normal sm:text-[24px]">
                                {t(`partnerProgram.howEasy.standards.items.${standard}.title`)}
                            </h3>
                            <p className="text-body text-ink-secondary">
                                {t(
                                    `partnerProgram.howEasy.standards.items.${standard}.description`,
                                )}
                            </p>
                        </li>
                    ))}
                </ol>
                {/* Last in reading order; beside the label from 640px. */}
                <p className="text-sm leading-normal text-ink-muted sm:col-start-2 sm:row-start-1 sm:justify-self-end sm:text-right">
                    {t("partnerProgram.howEasy.standards.note")}
                </p>
            </div>

            <div className="flex flex-col gap-3 sm:gap-5">
                <p
                    id="partner-path-label"
                    className="font-mono text-kicker text-ink-muted uppercase"
                >
                    {t("partnerProgram.howEasy.pathLabel")}
                </p>
                <ol
                    aria-labelledby="partner-path-label"
                    className="grid grid-cols-1 sm:gap-y-10 md:grid-cols-3"
                >
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
            </div>

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
