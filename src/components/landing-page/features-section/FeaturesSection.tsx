import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { useTranslation } from "react-i18next";
import { FEATURES_CARD_DATA } from "@/components/landing-page/features-section/FeaturesSection.data.ts";
import { SectionHeading } from "@/components/landing-page/common/SectionHeading.tsx";

export default function FeaturesSection() {
    const { t } = useTranslation();

    return (
        <section className="py-20 px-4 bg-surface-bright">
            <div className="max-w-7xl mx-auto">
                <SectionHeading
                    headline={t("landingPage.features.title")}
                    description={t("landingPage.features.subtitle")}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
                    {FEATURES_CARD_DATA.map((feature) => (
                        <Card
                            key={feature.titleKey}
                            className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-primary/10 hover:border-primary/30"
                        >
                            <CardHeader>
                                <div className="flex items-center justify-between flex-row gap-4 mb-4">
                                    <div className="w-12 h-12 bg-surface-container-high flex items-center justify-center transition-colors">
                                        <feature.icon className="w-6 h-6 text-primary" />
                                    </div>
                                    {feature.isPreview && (
                                        <span className="uppercase inline-block px-2 py-1 grow-0 text-xs font-medium bg-surface-container-highest">
                                            {t("landingPage.features.previewBadge")}
                                        </span>
                                    )}
                                </div>
                                <CardTitle className="text-2xl font-display text-primary font-normal">
                                    {t(feature.titleKey)}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{t(feature.descKey)}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
