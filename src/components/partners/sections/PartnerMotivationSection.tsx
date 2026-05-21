import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { useTranslation } from "react-i18next";
import { SectionHeading } from "@/components/landing-page/common/SectionHeading.tsx";
import {
    BadgeCheck,
    Globe,
    Sparkles,
    TrendingUp,
    Wallet,
    Zap,
    type LucideIcon,
} from "lucide-react";

type MotivationItem = {
    readonly key: string;
    readonly icon: LucideIcon;
};

const MOTIVATION_ITEMS: readonly MotivationItem[] = [
    { key: "audience", icon: Globe },
    { key: "traffic", icon: TrendingUp },
    { key: "highIntent", icon: Sparkles },
    { key: "trust", icon: BadgeCheck },
    { key: "realtime", icon: Zap },
    { key: "noCommission", icon: Wallet },
] as const;

export default function PartnerMotivationSection() {
    const { t } = useTranslation();

    return (
        <section className="py-20 px-4 bg-surface-bright">
            <div className="max-w-7xl mx-auto">
                <SectionHeading
                    headline={t("partners.motivation.title")}
                    description={t("partners.motivation.subtitle")}
                    showDivider={false}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
                    {MOTIVATION_ITEMS.map((item) => (
                        <Card
                            key={item.key}
                            className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-primary/10 hover:border-primary/30"
                        >
                            <CardHeader>
                                <div className="flex items-center justify-between flex-row gap-4 mb-4">
                                    <div className="w-12 h-12 bg-surface-container-high flex items-center justify-center transition-colors">
                                        <item.icon
                                            className="w-6 h-6 text-primary"
                                            aria-hidden="true"
                                        />
                                    </div>
                                </div>
                                <CardTitle className="text-2xl font-display text-primary font-normal">
                                    {t(`partners.motivation.items.${item.key}.title`)}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    {t(`partners.motivation.items.${item.key}.description`)}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
