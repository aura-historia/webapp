import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { useTranslation } from "react-i18next";
import { Check, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/landing-page/common/SectionHeading.tsx";
import { PRICING_TIERS } from "@/components/landing-page/pricing-section/PricingSection.data.ts";
import { useUserPreferences } from "@/hooks/preferences/useUserPreferences.tsx";

export default function PricingSection() {
    const { t, i18n } = useTranslation();
    const { preferences } = useUserPreferences();
    const currency = preferences.currency ?? "EUR";

    const formatPrice = (tier: (typeof PRICING_TIERS)[number]) => {
        if (tier.priceLabelKey) {
            return t(tier.priceLabelKey);
        }

        const amount = tier.prices?.[currency] ?? tier.prices?.EUR;

        if (amount === undefined) {
            return t("landingPage.pricing.comingSoon");
        }

        return new Intl.NumberFormat(i18n.language, {
            style: "currency",
            currency,
        }).format(amount);
    };

    return (
        <section
            className="bg-background px-4 py-24 sm:px-8"
            aria-label={t("landingPage.pricing.title")}
        >
            <div className="mx-auto max-w-7xl">
                <SectionHeading
                    headline={t("landingPage.pricing.title")}
                    description={t("landingPage.pricing.subtitle")}
                    showDivider={false}
                />
                <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
                    {PRICING_TIERS.map((tier) => (
                        <Card
                            key={tier.nameKey}
                            className={`relative flex flex-col border-2 transition-all duration-300 ${
                                tier.isHighlighted
                                    ? "border-primary shadow-lg scale-[1.02]"
                                    : "border-border/20 hover:border-primary/30"
                            }`}
                        >
                            {tier.isHighlighted && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <span className="bg-primary px-4 py-1.5 text-xs font-medium uppercase text-primary-foreground">
                                        {t("landingPage.pricing.mostPopular")}
                                    </span>
                                </div>
                            )}
                            <CardHeader className="pb-4 pt-8 text-center">
                                <CardTitle className="font-display text-2xl font-normal text-primary">
                                    {t(tier.nameKey)}
                                </CardTitle>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {t(tier.descKey)}
                                </p>
                                <div className="mt-6">
                                    <span className="font-display text-4xl font-normal text-foreground">
                                        {formatPrice(tier)}
                                    </span>
                                    <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
                                        {t("landingPage.pricing.billingNote")}
                                    </p>
                                </div>
                            </CardHeader>
                            <CardContent className="flex flex-1 flex-col pt-4">
                                <ul className="flex-1 space-y-4">
                                    {tier.features.map((feature) => (
                                        <li
                                            key={feature.key}
                                            className={`flex items-start gap-3 text-sm ${
                                                feature.isAccent
                                                    ? "font-semibold text-primary"
                                                    : "text-muted-foreground"
                                            }`}
                                        >
                                            {feature.isAccent ? (
                                                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                            ) : (
                                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                            )}
                                            <span>{t(feature.key)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
