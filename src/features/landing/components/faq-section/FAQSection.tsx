import { useId, useState } from "react";
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
import { FAQ_DATA } from "@/features/landing/components/faq-section/FAQSection.data.ts";
import { LANDING_PAGE_FRAGMENTS } from "@/features/landing/config/landingPageFragments.ts";
import { cn } from "@/lib/utils.ts";

export function FaqItem({
    question,
    answer,
    isOpen,
    onToggle,
}: {
    readonly question: string;
    readonly answer: string;
    readonly isOpen: boolean;
    readonly onToggle: () => void;
}) {
    const answerId = useId();

    return (
        <div
            className={cn(
                "border-b border-line",
                isOpen ? "pt-3.5 pb-5 sm:py-6" : "py-2 sm:py-[22px]",
            )}
        >
            <h3 className="font-normal">
                <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    onClick={onToggle}
                    className={cn(
                        "flex min-h-12 w-full cursor-pointer items-center justify-between gap-4 text-left font-serif text-[19px] leading-[1.3] text-ink sm:min-h-11 sm:text-question",
                        NAV_FOCUS_CLASS,
                    )}
                >
                    {question}
                    <span aria-hidden="true" className="shrink-0 font-sans text-[22px] font-light">
                        {isOpen ? "−" : "+"}
                    </span>
                </button>
            </h3>
            <p
                id={answerId}
                hidden={!isOpen}
                className="mt-2.5 max-w-[620px] text-[15px] leading-[1.65] text-ink-secondary sm:mt-3.5 sm:text-base"
            >
                {answer}
            </p>
        </div>
    );
}

/** VII — Questions: serif questions between hairlines, one answer open at a time. */
export default function FAQSection() {
    const { t } = useTranslation();
    const [openIndex, setOpenIndex] = useState(0);

    return (
        <LandingSection
            ground="raised"
            id={LANDING_PAGE_FRAGMENTS.faq}
            labelledBy="faq-heading"
            containerClassName="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-[clamp(40px,6vw,96px)]"
        >
            <SectionHeading
                id="faq-heading"
                eyebrow={t("landingPage.faq.eyebrow")}
                title={<Trans i18nKey="landingPage.faq.title" components={HEADLINE_COMPONENTS} />}
                intro={
                    <Trans
                        i18nKey="landingPage.faq.contact"
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
                {FAQ_DATA.map((item, index) => (
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
