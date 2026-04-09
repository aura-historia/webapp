import { useTranslation } from "react-i18next";
import { HOW_IT_WORKS_STEPS } from "@/components/landing-page/how-it-works-section/HowItWorksSection.data.ts";
import { SectionHeading } from "@/components/landing-page/common/SectionHeading.tsx";

export default function HowItWorksSection() {
    const { t } = useTranslation();

    return (
        <section
            className="bg-surface-container-high px-4 py-24 sm:px-8"
            aria-labelledby="how-it-works-title"
        >
            <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-20">
                <SectionHeading
                    headline={t("landingPage.howItWorks.title")}
                    description={t("landingPage.howItWorks.subtitle")}
                    showDivider={true}
                />

                <div className="relative w-full">
                    <div
                        className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-10 hidden h-px bg-outline-variant/70 lg:block"
                        aria-hidden
                    />
                    <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
                        {HOW_IT_WORKS_STEPS.map((step, index) => {
                            const isLastStep = index === HOW_IT_WORKS_STEPS.length - 1;

                            return (
                                <article
                                    key={step.number}
                                    className="flex flex-col items-center px-6 pb-12 text-center"
                                >
                                    <div
                                        className={`relative mb-4 grid h-20 w-20 place-items-center shadow-[0_0_0_8px_var(--color-surface-container-high)] ${
                                            isLastStep
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-surface-bright text-primary"
                                        }`}
                                    >
                                        <span className="font-display text-[1.875rem] italic leading-none">
                                            {step.number}
                                        </span>
                                    </div>
                                    <h3 className="mb-3 pt-4 font-display text-2xl font-normal leading-8 text-primary">
                                        {t(step.titleKey)}
                                    </h3>
                                    <p className="text-sm leading-6.5 text-secondary">
                                        {t(step.descKey)}
                                    </p>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
