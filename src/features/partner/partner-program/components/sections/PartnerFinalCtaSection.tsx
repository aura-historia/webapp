import { Link } from "@tanstack/react-router";
import { ArrowRight, Mail } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import {
    CONTACT_EMAIL,
    NAV_FOCUS_CLASS,
} from "@/features/app-shell/components/navigation/navigationConfig.ts";
import { LandingSection } from "@/features/landing/components/common/LandingSection.tsx";
import {
    HEADLINE_COMPONENTS,
    SectionHeading,
} from "@/features/landing/components/common/SectionHeading.tsx";
import { PARTNER_PROGRAM_FRAGMENTS } from "@/features/partner/partner-program/config/partnerProgramFragments.ts";
import { cn } from "@/lib/utils.ts";

/** The closing oxblood band: apply in the partner dashboard, or write to the partner team. */
export default function PartnerFinalCtaSection() {
    const { t } = useTranslation();

    return (
        <LandingSection
            ground="oxblood"
            id={PARTNER_PROGRAM_FRAGMENTS.apply}
            labelledBy="partner-final-cta-title"
            className="py-16 sm:py-[clamp(72px,9vw,120px)]"
            containerClassName="grid grid-cols-1 items-end gap-8 lg:grid-cols-2 lg:gap-12"
        >
            <SectionHeading
                id="partner-final-cta-title"
                onInk
                eyebrowClassName="text-brass-light"
                eyebrow={t("partnerProgram.finalCta.eyebrow")}
                title={
                    <Trans
                        i18nKey="partnerProgram.finalCta.title"
                        components={HEADLINE_COMPONENTS}
                    />
                }
                intro={
                    <span className="text-on-oxblood-muted">
                        {t("partnerProgram.finalCta.subtitle")}
                    </span>
                }
            />
            <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3 lg:justify-end">
                <Link
                    to="/$lng/partners/applications"
                    params={true}
                    from="/$lng"
                    data-theme="light"
                    className={cn(
                        "inline-flex h-[52px] items-center justify-center gap-2.5 rounded-pill bg-surface px-7 text-[15px] font-medium text-ink transition-opacity hover:opacity-90 sm:h-[54px]",
                        NAV_FOCUS_CLASS,
                    )}
                >
                    {t("partnerProgram.finalCta.primary")}
                    <ArrowRight aria-hidden="true" className="size-4" strokeWidth={1.8} />
                </Link>
                <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className={cn(
                        "inline-flex h-[52px] items-center justify-center gap-2.5 rounded-pill px-7 text-[15px] text-on-oxblood shadow-[inset_0_0_0_1px_rgba(251,248,242,0.4)] transition-shadow hover:shadow-[inset_0_0_0_1px_var(--on-oxblood)] sm:h-[54px]",
                        NAV_FOCUS_CLASS,
                    )}
                >
                    <Mail aria-hidden="true" className="size-4" strokeWidth={1.8} />
                    {t("partnerProgram.finalCta.secondary")}
                </a>
            </div>
        </LandingSection>
    );
}
