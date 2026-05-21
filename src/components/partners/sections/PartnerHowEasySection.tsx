import { useTranslation } from "react-i18next";
import { SectionHeading } from "@/components/landing-page/common/SectionHeading.tsx";

const STEPS = [
    { number: "01", key: "apply" },
    { number: "02", key: "claim" },
    { number: "03", key: "connect" },
] as const;

export default function PartnerHowEasySection() {
    const { t } = useTranslation();

    return (
        <section
            className="bg-surface-container-high px-4 py-24 sm:px-8"
            aria-labelledby="partner-how-easy-title"
        >
            <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-20">
                <SectionHeading
                    headline={t("partners.howEasy.title")}
                    description={t("partners.howEasy.subtitle")}
                    showDivider={true}
                />

                <div className="relative w-full">
                    <div
                        className="pointer-events-none absolute left-[16.6%] right-[16.6%] top-10 hidden h-px bg-outline-variant/70 lg:block"
                        aria-hidden="true"
                    />
                    <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-0">
                        {STEPS.map((step, index) => {
                            const isLast = index === STEPS.length - 1;
                            return (
                                <article
                                    key={step.number}
                                    className="flex flex-col items-center px-6 pb-12 text-center"
                                >
                                    <div
                                        className={`relative mb-4 grid h-20 w-20 place-items-center shadow-[0_0_0_8px_var(--color-surface-container-high)] ${
                                            isLast
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-surface-bright text-primary"
                                        }`}
                                    >
                                        <span className="font-display text-[1.875rem] italic leading-none">
                                            {step.number}
                                        </span>
                                    </div>
                                    <h3 className="mb-3 pt-4 font-display text-2xl font-normal leading-8 text-primary">
                                        {t(`partners.howEasy.steps.${step.key}.title`)}
                                    </h3>
                                    <p className="text-sm leading-6.5 text-secondary">
                                        {t(`partners.howEasy.steps.${step.key}.description`)}
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
