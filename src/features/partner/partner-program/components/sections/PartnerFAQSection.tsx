import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { CONTACT_EMAIL } from "@/features/app-shell/components/navigation/navigationConfig.ts";
import { LandingSection } from "@/features/landing/components/common/LandingSection.tsx";
import {
    HEADLINE_COMPONENTS,
    SectionHeading,
} from "@/features/landing/components/common/SectionHeading.tsx";
import { FaqItem } from "@/features/landing/components/faq-section/FAQSection.tsx";
import { PARTNER_PROGRAM_FRAGMENTS } from "@/features/partner/partner-program/config/partnerProgramFragments.ts";

const FAQ_KEYS = [
    "free",
    "cancel",
    "technical",
    "exclusivity",
    "data",
    "transactions",
    "fit",
    "support",
] as const;

/** V — Questions: the landing page's FAQ pattern with the partner questions, one answer open at a time. */
export default function PartnerFAQSection() {
    const { t } = useTranslation();
    const [openIndex, setOpenIndex] = useState(0);

    return (
        <LandingSection
            ground="raised"
            id={PARTNER_PROGRAM_FRAGMENTS.faq}
            labelledBy="partner-faq-heading"
            containerClassName="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-[clamp(40px,6vw,96px)]"
        >
            <SectionHeading
                id="partner-faq-heading"
                eyebrow={`V — ${t("partnerProgram.faq.eyebrow")}`}
                title={
                    <Trans i18nKey="partnerProgram.faq.title" components={HEADLINE_COMPONENTS} />
                }
                intro={
                    <Trans
                        i18nKey="partnerProgram.faq.contact"
                        values={{ email: CONTACT_EMAIL }}
                        components={{
                            mail: (
                                // biome-ignore lint/a11y/useAnchorContent: Trans fills in the address.
                                <a
                                    href={`mailto:${CONTACT_EMAIL}`}
                                    className="text-oxblood underline underline-offset-3"
                                />
                            ),
                        }}
                    />
                }
            />
            <div className="border-t border-line">
                {FAQ_KEYS.map((key, index) => (
                    <FaqItem
                        key={key}
                        question={t(`partnerProgram.faq.items.${key}.question`)}
                        answer={t(`partnerProgram.faq.items.${key}.answer`)}
                        isOpen={openIndex === index}
                        onToggle={() => setOpenIndex((current) => (current === index ? -1 : index))}
                    />
                ))}
            </div>
        </LandingSection>
    );
}
