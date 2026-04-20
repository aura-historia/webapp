import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { useTranslation } from "react-i18next";
import { Check, Loader2, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/landing-page/common/SectionHeading.tsx";
import {
    PRICING_TIERS,
    type BillingInterval,
    type PricingTier,
} from "@/components/landing-page/pricing-section/PricingSection.data.ts";
import { useUserPreferences } from "@/hooks/preferences/useUserPreferences.tsx";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useStripeBilling } from "@/hooks/billing/useStripeBilling.ts";
import type { BillingCycleData, BillingPlanData } from "@/client";

export default function PricingSection() {
    const { t, i18n } = useTranslation();
    const { preferences } = useUserPreferences();
    const currency = preferences.currency ?? "EUR";
    const [billingInterval, setBillingInterval] = useState<BillingInterval>("yearly");
    const { user, toSignUp } = useAuthenticator((context) => [context.user, context.toSignUp]);
    const { handleSubscribe, isLoading } = useStripeBilling();

    const isYearly = billingInterval === "yearly";

    const BILLING_PLAN_MAP: Record<string, BillingPlanData> = {
        pro: "PRO",
        ultimate: "ULTIMATE",
    };

    const toBillingPlan = (tier: PricingTier): BillingPlanData => BILLING_PLAN_MAP[tier.id];

    const toBillingCycle = (): BillingCycleData => (isYearly ? "YEARLY" : "MONTHLY");

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat(i18n.language, {
            style: "currency",
            currency,
        }).format(amount);
    };

    const getMonthlyPrice = (tier: (typeof PRICING_TIERS)[number]) => {
        return tier.prices?.[currency];
    };

    const getYearlyPerMonthPrice = (tier: (typeof PRICING_TIERS)[number]) => {
        const yearlyTotal = tier.yearlyPrices?.[currency];
        if (yearlyTotal === undefined) return undefined;
        return yearlyTotal / 12;
    };

    const formatPrice = (tier: (typeof PRICING_TIERS)[number]) => {
        if (tier.priceLabelKey) {
            return t(tier.priceLabelKey);
        }

        if (isYearly) {
            const perMonth = getYearlyPerMonthPrice(tier);
            if (perMonth !== undefined) {
                return formatAmount(perMonth);
            }
        }

        const amount = getMonthlyPrice(tier);
        if (amount === undefined) {
            return t("landingPage.pricing.comingSoon");
        }

        return formatAmount(amount);
    };

    const renderStrikethroughPrice = (tier: (typeof PRICING_TIERS)[number]) => {
        if (!isYearly || tier.priceLabelKey || !tier.yearlyPrices) return null;

        const monthlyAmount = getMonthlyPrice(tier);
        if (monthlyAmount === undefined) return null;

        return (
            <span className="text-lg text-muted-foreground line-through">
                {formatAmount(monthlyAmount)}
            </span>
        );
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

                {/* Billing interval toggle */}
                <div className="mt-8 flex items-center justify-center gap-3">
                    <span
                        className={`text-sm font-medium transition-colors duration-300 ${
                            !isYearly ? "text-foreground" : "text-muted-foreground"
                        }`}
                    >
                        {t("landingPage.pricing.monthly")}
                    </span>
                    <Switch
                        checked={isYearly}
                        onCheckedChange={(checked) =>
                            setBillingInterval(checked ? "yearly" : "monthly")
                        }
                    />
                    <span
                        className={`text-sm font-medium transition-colors duration-300 ${
                            isYearly ? "text-foreground" : "text-muted-foreground"
                        }`}
                    >
                        {t("landingPage.pricing.yearly")}
                    </span>
                    <span className="rounded-sm bg-tertiary/10 px-2 py-0.5 text-xs font-semibold text-tertiary">
                        {t("landingPage.pricing.yearlySavings")}
                    </span>
                </div>

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
                                    {renderStrikethroughPrice(tier)}
                                    <span className="ps-2 font-display text-4xl font-normal text-foreground">
                                        {formatPrice(tier)}
                                    </span>
                                    <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
                                        {tier.priceLabelKey
                                            ? t("landingPage.pricing.billingNote")
                                            : isYearly
                                              ? t("landingPage.pricing.billingNoteYearly")
                                              : t("landingPage.pricing.billingNoteMonthly")}
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
                                {tier.id === "free" ? (
                                    user ? (
                                        <Button variant="outline" className="mt-8 w-full" disabled>
                                            {t("landingPage.pricing.getStartedFree")}
                                        </Button>
                                    ) : (
                                        <Button
                                            asChild
                                            onClick={toSignUp}
                                            variant="outline"
                                            className="mt-8 w-full"
                                        >
                                            <Link to="/login">
                                                {t("landingPage.pricing.getStartedFree")}
                                            </Link>
                                        </Button>
                                    )
                                ) : (
                                    <Button
                                        variant={tier.isHighlighted ? "default" : "outline"}
                                        className="mt-8 w-full"
                                        type="button"
                                        disabled={isLoading}
                                        onClick={() =>
                                            handleSubscribe(toBillingPlan(tier), toBillingCycle())
                                        }
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            t("landingPage.pricing.subscribe")
                                        )}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
