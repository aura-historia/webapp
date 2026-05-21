import { useTranslation } from "react-i18next";
import { SectionHeading } from "@/components/landing-page/common/SectionHeading.tsx";

const STATS = ["trafficIncrease", "newBuyers", "countries", "setup"] as const;

export default function PartnerStatsSection() {
    const { t } = useTranslation();

    return (
        <section className="bg-surface-container-low border-t border-b border-outline-variant/10 py-24 px-4">
            <div className="max-w-7xl mx-auto">
                <SectionHeading
                    headline={t("partners.stats.title")}
                    description={t("partners.stats.subtitle")}
                    showDivider={true}
                />

                <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {STATS.map((stat) => (
                        <div
                            key={stat}
                            className="flex flex-col justify-center bg-white border border-outline-variant/10 p-8 text-center"
                        >
                            <p className="text-2xl sm:text-4xl font-display text-primary mb-3">
                                {t(`partners.stats.${stat}.value`)}
                            </p>
                            <p className="text-xs font-medium text-secondary uppercase tracking-widest">
                                {t(`partners.stats.${stat}.label`)}
                            </p>
                        </div>
                    ))}
                </div>

                <p className="mt-8 text-center text-xs text-muted-foreground max-w-2xl mx-auto">
                    {t("partners.stats.disclaimer")}
                </p>
            </div>
        </section>
    );
}
