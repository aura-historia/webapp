import { H2 } from "@/components/typography/H2.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { useTranslation } from "react-i18next";
import {
    Search,
    Bell,
    TrendingDown,
    Globe,
    History,
    Heart,
    Languages,
    Funnel,
    Bot,
} from "lucide-react";

const features = [
    {
        icon: Search,
        titleKey: "landingPage.features.search.title",
        descKey: "landingPage.features.search.description",
    },
    {
        icon: Globe,
        titleKey: "landingPage.features.global.title",
        descKey: "landingPage.features.global.description",
    },
    {
        icon: Bell,
        titleKey: "landingPage.features.notifications.title",
        descKey: "landingPage.features.notifications.description",
    },
    {
        icon: TrendingDown,
        titleKey: "landingPage.features.priceTracking.title",
        descKey: "landingPage.features.priceTracking.description",
    },
    {
        icon: History,
        titleKey: "landingPage.features.history.title",
        descKey: "landingPage.features.history.description",
    },
    {
        icon: Heart,
        titleKey: "landingPage.features.watchlist.title",
        descKey: "landingPage.features.watchlist.description",
    },
    {
        icon: Languages,
        titleKey: "landingPage.features.translations.title",
        descKey: "landingPage.features.translations.description",
    },
    {
        icon: Funnel,
        titleKey: "landingPage.features.personalFilter.title",
        descKey: "landingPage.features.personalFilter.description",
        isPreview: true,
    },
    {
        icon: Bot,
        titleKey: "landingPage.features.aiSearchAgent.title",
        descKey: "landingPage.features.aiSearchAgent.description",
        isPreview: true,
    },
];

export default function FeaturesSection() {
    const { t } = useTranslation();

    return (
        <section className="py-20 px-4 bg-muted/30">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <H2 className="mb-4">{t("landingPage.features.title")}</H2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        {t("landingPage.features.subtitle")}
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature) => (
                        <Card
                            key={feature.titleKey}
                            className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-primary/10 hover:border-primary/30"
                        >
                            <CardHeader>
                                <div className="flex items-center justify-between flex-row gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                        <feature.icon className="w-6 h-6 text-primary" />
                                    </div>
                                    {feature.isPreview && (
                                        <span className="inline-block px-4 py-2 grow-0 text-xs font-medium bg-primary/10 rounded-full">
                                            {t("landingPage.features.previewBadge")}
                                        </span>
                                    )}
                                </div>
                                <CardTitle className="text-xl">{t(feature.titleKey)}</CardTitle>
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
