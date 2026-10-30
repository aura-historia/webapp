import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import { ABOUT_FAQ_ITEMS, ABOUT_SECTION_IDS } from "@/features/about/config/aboutPage.data";
import { ABOUT_SPLIT_CLASS } from "@/features/about/lib/aboutStyles.ts";
import { CONTACT_EMAIL } from "@/features/app-shell/components/navigation/navigationConfig.ts";
import { LandingSection } from "@/features/landing/components/common/LandingSection.tsx";
import {
    HEADLINE_COMPONENTS,
    SectionHeading,
} from "@/features/landing/components/common/SectionHeading.tsx";
import { FaqItem } from "@/features/landing/components/faq-section/FAQSection.tsx";
import { cn } from "@/lib/utils.ts";

/** V — Questions: the shared accordion; closed answers stay in the markup for crawlers. */
export function AboutFaqSection() {
    const { t } = useTranslation();
    const [openIndex, setOpenIndex] = useState(0);

    return (
        <LandingSection
            ground="raised"
            id={ABOUT_SECTION_IDS.faq}
            labelledBy="about-faq-heading"
            containerClassName={cn(ABOUT_SPLIT_CLASS, "items-start gap-8")}
        >
            <SectionHeading
                id="about-faq-heading"
                eyebrow={`V — ${t("aboutPage.faq.eyebrow")}`}
                title={<Trans i18nKey="aboutPage.faq.title" components={HEADLINE_COMPONENTS} />}
                intro={
                    <Trans
                        i18nKey="aboutPage.faq.contact"
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
                {ABOUT_FAQ_ITEMS.map((item, index) => (
                    <FaqItem
                        key={item.questionKey}
                        question={t(item.questionKey)}
                        answer={t(item.answerKey)}
                        isOpen={openIndex === index}
                        onToggle={() => setOpenIndex((current) => (current === index ? -1 : index))}
                    />
                ))}
            </div>
        </LandingSection>
    );
}
