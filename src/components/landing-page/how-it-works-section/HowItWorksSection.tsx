import { useTranslation } from "react-i18next";
import { HOW_IT_WORKS_STEPS } from "@/components/landing-page/how-it-works-section/HowItWorksSection.data.ts";
import { SectionHeading } from "@/components/landing-page/common/SectionHeading.tsx";

export default function HowItWorksSection() {
    const { t } = useTranslation();

    return (
        <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
                <SectionHeading
                    headline={t("landingPage.howItWorks.title")}
                    description={t("landingPage.howItWorks.subtitle")}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {HOW_IT_WORKS_STEPS.map((step, index) => (
                        <div key={step.number} className="relative">
                            {/* Connector line */}
                            {index < HOW_IT_WORKS_STEPS.length - 1 && (
                                <div className="hidden lg:block absolute top-8 left-[60%] w-full h-0.5 bg-linear-to-r from-primary/10 via-primary/50 to-primary/10 " />
                            )}
                            <div className="relative z-10 text-center">
                                <div className="inline-flex items-center justify-center rounded-full w-16 h-16 border-2 border-primary/30 mb-6 bg-card">
                                    <span className="relative text-2xl font-bold text-primary">
                                        {step.number}
                                    </span>
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{t(step.titleKey)}</h3>
                                <p className="text-muted-foreground">{t(step.descKey)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
