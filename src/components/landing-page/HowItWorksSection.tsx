import { H2 } from "@/components/typography/H2.tsx";
import { useTranslation } from "react-i18next";

const steps = [
    {
        number: "1",
        titleKey: "landingPage.howItWorks.step1.title",
        descKey: "landingPage.howItWorks.step1.description",
    },
    {
        number: "2",
        titleKey: "landingPage.howItWorks.step2.title",
        descKey: "landingPage.howItWorks.step2.description",
    },
    {
        number: "3",
        titleKey: "landingPage.howItWorks.step3.title",
        descKey: "landingPage.howItWorks.step3.description",
    },
    {
        number: "4",
        titleKey: "landingPage.howItWorks.step4.title",
        descKey: "landingPage.howItWorks.step4.description",
    },
];

export default function HowItWorksSection() {
    const { t } = useTranslation();

    return (
        <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <H2 className="mb-4">{t("landingPage.howItWorks.title")}</H2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        {t("landingPage.howItWorks.subtitle")}
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <div key={step.number} className="relative">
                            {/* Connector line */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-8 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/10 via-primary/50 to-primary/10 " />
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
