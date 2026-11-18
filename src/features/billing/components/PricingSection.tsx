import { Link } from "@tanstack/react-router";
import { Check, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import type { BillingCycle } from "@/data/internal/billing/BillingCycle.ts";
import type { SubscriptionType } from "@/data/internal/account/SubscriptionType.ts";
import type { BillingPlan } from "@/data/internal/billing/BillingPlan.ts";
import { CURRENCY_MINOR_UNIT_EXPONENTS, parseCurrency } from "@/data/internal/common/Currency.ts";
import { NAV_FOCUS_CLASS } from "@/features/app-shell/components/navigation/navigationConfig.ts";
import { useUserAccount } from "@/features/account-management/hooks/useUserAccount.ts";
import { useResolvedAuth } from "@/features/authentication/hooks/useResolvedAuth.ts";
import {
    type BillingInterval,
    PRICING_TIERS,
    type PricingTier,
} from "@/features/billing/components/PricingSection.data.ts";
import { useStripeBilling } from "@/features/billing/hooks/useStripeBilling.ts";
import { type PricingCta, pricingCtaFor } from "@/features/billing/lib/pricingCta.ts";
import { LandingSection } from "@/features/landing/components/common/LandingSection.tsx";
import {
    HEADLINE_COMPONENTS,
    SectionHeading,
} from "@/features/landing/components/common/SectionHeading.tsx";
import { LANDING_PAGE_FRAGMENTS } from "@/features/landing/config/landingPageFragments.ts";
import { useUserPreferences } from "@/features/preferences/hooks/useUserPreferences.tsx";
import { cn } from "@/lib/utils.ts";

const CTA_BASE = cn(
    "mt-auto flex h-13 w-full cursor-pointer items-center justify-center rounded-pill text-base transition-opacity disabled:cursor-default disabled:opacity-35 sm:h-12 sm:text-[15px]",
    NAV_FOCUS_CLASS,
);
const CTA_PRIMARY = "bg-surface font-medium text-ink hover:opacity-90";
const CTA_SECONDARY = "text-ink shadow-[inset_0_0_0_1px_var(--line-strong)] hover:text-brass-ink";
/** The visitor's own plan: a status in the CTA's place, not an action. */
const CTA_CURRENT = "cursor-default gap-2 text-ink-secondary shadow-[inset_0_0_0_1px_var(--line)]";
/** From this many characters (e.g. "1 399 TWD") the prices step down a size to fit the cards. */
const LONG_PRICE_LENGTH = 9;

/**
 * The plan sent to the billing entrypoint. Paid visitors always get the Stripe customer portal,
 * where plan changes happen, so the Free card sends their current plan to open it.
 */
function billingPlanFor(tier: SubscriptionType, currentPlan?: SubscriptionType): BillingPlan {
    switch (tier) {
        case "pro":
            return "PRO";
        case "ultimate":
            return "ULTIMATE";
        case "free":
            return currentPlan === "ultimate" ? "ULTIMATE" : "PRO";
    }
}

const CTA_LABEL_KEYS: Record<PricingCta, string> = {
    "get-started": "landingPage.pricing.getStartedFree",
    subscribe: "landingPage.pricing.subscribe",
    current: "landingPage.pricing.currentPlan",
    upgrade: "landingPage.pricing.upgrade",
    switch: "landingPage.pricing.switchPlan",
};

interface PricingCtaControlProps {
    readonly cta: PricingCta;
    /** The highlighted card on the ink ground. */
    readonly isInk: boolean;
    /** Auth has resolved to a signed-out visitor, who can sign up for Free. */
    readonly canSignUp: boolean;
    /** A billing session is being created. */
    readonly isBusy: boolean;
    /** Signed in, but the current plan is still loading. */
    readonly isPlanPending: boolean;
    readonly onSelect: () => void;
}

function PricingCtaControl({
    cta,
    isInk,
    canSignUp,
    isBusy,
    isPlanPending,
    onSelect,
}: PricingCtaControlProps) {
    const { t } = useTranslation();
    const label = t(CTA_LABEL_KEYS[cta]);

    if (cta === "current") {
        return (
            <p className={cn(CTA_BASE, CTA_CURRENT)}>
                <Check aria-hidden="true" className="size-4 shrink-0" strokeWidth={2} />
                {label}
            </p>
        );
    }

    if (cta === "get-started") {
        // Auth still restoring, or signed in with the plan unknown: nothing to start yet.
        if (!canSignUp) {
            return (
                <button type="button" disabled className={cn(CTA_BASE, CTA_SECONDARY)}>
                    {label}
                </button>
            );
        }

        return (
            <Link
                to="/$lng/login"
                search={{ mode: "sign-up" }}
                params={true}
                from="/$lng"
                className={cn(CTA_BASE, CTA_SECONDARY)}
            >
                {label}
            </Link>
        );
    }

    // Upgrades are the recommended path on the highlighted card; a switch down stays secondary.
    const isPrimary = isInk && cta !== "switch";

    return (
        <button
            type="button"
            data-theme={isPrimary ? "light" : undefined}
            disabled={isBusy || isPlanPending}
            onClick={onSelect}
            className={cn(CTA_BASE, isPrimary ? CTA_PRIMARY : CTA_SECONDARY)}
        >
            {isBusy ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : label}
        </button>
    );
}

interface IntervalToggleProps {
    readonly value: BillingInterval;
    readonly onChange: (value: BillingInterval) => void;
}

function IntervalToggle({ value, onChange }: IntervalToggleProps) {
    const { t } = useTranslation();
    const optionClass = cn(
        "inline-flex h-10 flex-1 cursor-pointer items-center justify-center gap-2.5 rounded-pill px-[18px] text-sm transition-colors sm:flex-none",
        NAV_FOCUS_CLASS,
    );

    return (
        <fieldset className="m-0 flex w-full items-center gap-1 rounded-pill border-0 bg-surface-sunken p-1 sm:inline-flex sm:w-auto">
            <legend className="sr-only">{t("landingPage.pricing.billingInterval")}</legend>
            <button
                type="button"
                aria-pressed={value === "monthly"}
                onClick={() => onChange("monthly")}
                className={cn(
                    optionClass,
                    value === "monthly"
                        ? "bg-ink font-medium text-surface"
                        : "text-ink-secondary hover:text-ink",
                )}
            >
                {t("landingPage.pricing.monthly")}
            </button>
            <button
                type="button"
                aria-pressed={value === "yearly"}
                onClick={() => onChange("yearly")}
                className={cn(
                    optionClass,
                    "pr-2",
                    value === "yearly"
                        ? "bg-ink font-medium text-surface"
                        : "text-ink-secondary hover:text-ink",
                )}
            >
                {t("landingPage.pricing.yearly")}
                <span className="rounded-pill bg-oxblood px-2 py-[3px] font-mono text-tag font-normal text-on-oxblood uppercase">
                    {t("landingPage.pricing.yearlySavings")}
                </span>
            </button>
        </fieldset>
    );
}

/** V — Pricing: the three plans, billed monthly or yearly, in the visitor's currency. */
export default function PricingSection() {
    const { t, i18n } = useTranslation();
    const { preferences } = useUserPreferences();
    // Stored preferences are not validated on load; fall back to EUR for unsupported codes.
    const currency = parseCurrency(preferences.currency);
    const [billingInterval, setBillingInterval] = useState<BillingInterval>("yearly");
    const { isAuthenticated, isResolved: isAuthResolved } = useResolvedAuth();
    const { data: userAccount, isPending: isAccountPending } = useUserAccount();
    // Signed out, or the account has not loaded: every card keeps its default call to action.
    const currentPlan =
        isAuthResolved && isAuthenticated ? userAccount?.subscriptionType : undefined;
    const isPlanPending = isAuthResolved && isAuthenticated && isAccountPending;
    const { handleSubscribe, isLoading } = useStripeBilling();
    const isYearly = billingInterval === "yearly";
    const billingCycle: BillingCycle = isYearly ? "YEARLY" : "MONTHLY";

    // Charge precision follows the currency's minor unit (none for JPY and KRW), so a yearly
    // per-month equivalent never shows fractions the currency cannot be charged in.
    const minorUnitDigits = CURRENCY_MINOR_UNIT_EXPONENTS[currency];
    const formatAmount = (amount: number) =>
        new Intl.NumberFormat(i18n.language, {
            style: "currency",
            currency,
            minimumFractionDigits: Number.isInteger(amount) ? 0 : minorUnitDigits,
            maximumFractionDigits: minorUnitDigits,
        }).format(amount);

    const priceFor = (tier: PricingTier): { current: string; regular?: string } => {
        if (tier.id === "free") {
            return { current: formatAmount(0) };
        }

        const monthly = tier.prices[currency];

        if (isYearly) {
            // The yearly charge is ten monthly charges; show it spread over twelve months.
            return {
                current: formatAmount(tier.yearlyPrices[currency] / 12),
                regular: formatAmount(monthly),
            };
        }

        return { current: formatAmount(monthly) };
    };

    const prices = PRICING_TIERS.map(priceFor);
    // One size for the whole row, so a short free price never outsizes the paid ones.
    const hasLongPrice = prices.some((price) => price.current.length >= LONG_PRICE_LENGTH);

    const noteFor = (tier: PricingTier) => {
        if (tier.id === "free") return t("landingPage.pricing.alwaysFree");
        return isYearly
            ? t("landingPage.pricing.billingNoteYearly")
            : t("landingPage.pricing.billingNoteMonthly");
    };

    return (
        <LandingSection
            ground="surface"
            id={LANDING_PAGE_FRAGMENTS.pricing}
            labelledBy="pricing-heading"
            className="border-b border-line-subtle"
            containerClassName="flex flex-col gap-8 sm:gap-14"
        >
            <div className="flex flex-wrap items-end justify-between gap-8">
                <SectionHeading
                    id="pricing-heading"
                    className="max-w-[720px]"
                    eyebrow={t("landingPage.pricing.eyebrow")}
                    title={
                        <Trans
                            i18nKey="landingPage.pricing.title"
                            components={HEADLINE_COMPONENTS}
                        />
                    }
                    intro={t("landingPage.pricing.subtitle")}
                />
                <IntervalToggle value={billingInterval} onChange={setBillingInterval} />
            </div>

            <div className="grid grid-cols-1 items-stretch gap-3 sm:gap-4 lg:grid-cols-3">
                {PRICING_TIERS.map((tier, index) => {
                    const price = prices[index];
                    const isInk = tier.isHighlighted === true;

                    return (
                        <article
                            key={tier.id}
                            aria-labelledby={`pricing-${tier.id}`}
                            data-theme={isInk ? "dark" : undefined}
                            className={cn(
                                "flex flex-col gap-7 rounded-card p-[22px] text-ink sm:p-[clamp(24px,3vw,36px)]",
                                isInk
                                    ? "bg-surface shadow-[0_0_0_1px_rgba(184,147,90,0.45)]"
                                    : "bg-surface-raised shadow-ring",
                            )}
                        >
                            <div className="flex flex-col gap-2.5">
                                <div className="flex items-center justify-between gap-3">
                                    <h3
                                        id={`pricing-${tier.id}`}
                                        className={cn(
                                            "font-mono text-[10px] font-normal tracking-[0.16em] uppercase sm:text-kicker",
                                            isInk ? "text-brass" : "text-brass-ink",
                                        )}
                                    >
                                        {t(tier.nameKey)}
                                    </h3>
                                    {isInk && (
                                        <span className="rounded-sm bg-oxblood px-2 py-[3px] font-mono text-tag text-on-oxblood uppercase">
                                            {t("landingPage.pricing.mostPopular")}
                                        </span>
                                    )}
                                </div>
                                <p className="text-body-sm text-ink-secondary">{t(tier.descKey)}</p>
                            </div>

                            <div className="flex flex-col gap-2 border-t border-line pt-[22px]">
                                <div className="flex flex-wrap items-baseline gap-3">
                                    <span
                                        className={cn(
                                            "font-serif leading-none",
                                            hasLongPrice
                                                ? "text-[clamp(34px,11vw,40px)] sm:text-[48px] lg:text-[clamp(36px,3.4vw,48px)]"
                                                : "text-[min(52px,16vw)] sm:text-[clamp(48px,4.6vw,64px)]",
                                        )}
                                    >
                                        {price.current}
                                    </span>
                                    {price.regular && (
                                        <s className="font-serif text-[22px] text-ink-muted">
                                            <span className="sr-only">
                                                {t("landingPage.pricing.regularPrice")}{" "}
                                            </span>
                                            {price.regular}
                                        </s>
                                    )}
                                </div>
                                <span className="font-mono text-[10px] tracking-[0.14em] text-ink-muted uppercase sm:text-label">
                                    {noteFor(tier)}
                                </span>
                            </div>

                            <ul className="flex flex-col gap-3 text-body-sm leading-[1.45] text-ink-secondary">
                                {tier.features.map((feature) => (
                                    <li
                                        key={feature.key}
                                        className={cn(
                                            "flex gap-2.5",
                                            feature.isAccent && "font-semibold text-ink",
                                        )}
                                    >
                                        {feature.isAccent ? (
                                            <Sparkles
                                                aria-hidden="true"
                                                className="mt-0.5 size-4 shrink-0 text-brass-ink"
                                                strokeWidth={1.8}
                                            />
                                        ) : (
                                            <Check
                                                aria-hidden="true"
                                                className={cn(
                                                    "mt-0.5 size-4 shrink-0",
                                                    isInk ? "text-brass" : "text-oxblood",
                                                )}
                                                strokeWidth={2}
                                            />
                                        )}
                                        {t(feature.key)}
                                    </li>
                                ))}
                            </ul>

                            <PricingCtaControl
                                cta={pricingCtaFor(tier.id, currentPlan)}
                                isInk={isInk}
                                canSignUp={isAuthResolved && !isAuthenticated}
                                isBusy={isLoading}
                                isPlanPending={isPlanPending}
                                onSelect={() =>
                                    handleSubscribe(
                                        billingPlanFor(tier.id, currentPlan),
                                        billingCycle,
                                    )
                                }
                            />
                        </article>
                    );
                })}
            </div>
        </LandingSection>
    );
}
