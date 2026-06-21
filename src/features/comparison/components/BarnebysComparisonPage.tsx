import { Button } from "@/components/ui/button.tsx";
import { H1 } from "@/components/typography/H1.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { H3 } from "@/components/typography/H3.tsx";
import { cn } from "@/lib/utils.ts";
import { Link } from "@tanstack/react-router";
import type React from "react";
import { useTranslation } from "react-i18next";
import type { LucideIcon } from "lucide-react";
import {
    Bell,
    BrainCircuit,
    CheckCircle2,
    Clock3,
    Globe2,
    Languages,
    SearchCheck,
    Sparkles,
    Store,
    Telescope,
} from "lucide-react";

const PAGE_KEY = "compareBarnebysPage";

const MARKET_SOURCE_KEYS = [
    "auctionHouses",
    "auctionPlatforms",
    "antiqueDealers",
    "privateSellers",
    "marketplaces",
] as const;

type VerdictTone = "aura" | "barnebys";

type ComparisonRow = {
    readonly key: string;
    readonly tone: VerdictTone;
};

type FeatureCard = {
    readonly key: string;
    readonly icon: LucideIcon;
};

const QUICK_VERDICT_KEYS = [
    { key: "auctionDiscovery", tone: "barnebys" },
    { key: "marketSearch", tone: "aura" },
    { key: "multilingualDiscovery", tone: "aura" },
    { key: "realTimeMonitoring", tone: "aura" },
] satisfies Array<{ readonly key: string; readonly tone: VerdictTone }>;

const AURA_ADVANTAGES: FeatureCard[] = [
    { key: "marketBeyondAuctions", icon: Store },
    { key: "nearRealTimeAlerts", icon: Bell },
    { key: "languagePenalties", icon: Languages },
    { key: "aiForwardMatching", icon: BrainCircuit },
];

const COMPARISON_ROWS: ComparisonRow[] = [
    { key: "auctionHeritage", tone: "barnebys" },
    { key: "sourceCoverage", tone: "aura" },
    { key: "alertSpeed", tone: "aura" },
    { key: "languageHandling", tone: "aura" },
    { key: "alertRelevance", tone: "aura" },
    { key: "technologyDirection", tone: "aura" },
];

const DOWNSTREAM_ADVANTAGES: FeatureCard[] = [
    { key: "underRadarInventory", icon: Telescope },
    { key: "realMarket", icon: SearchCheck },
    { key: "beforeDigest", icon: Clock3 },
    { key: "acrossBorders", icon: Globe2 },
];

export const BARNEBYS_COMPARISON_FAQ_KEYS = [
    "alternative",
    "replace",
    "fasterAlerts",
    "multilingualSearch",
    "outsideAuctions",
] as const;

export function getBarnebysComparisonTranslationKey(path: string) {
    return `${PAGE_KEY}.${path}`;
}

export function BarnebysComparisonPage() {
    return (
        <article className="bg-background text-on-surface">
            <HeroSection />
            <SummarySection />
            <RespectSection />
            <AdvantageSection />
            <ScorecardSection />
            <DownstreamSection />
            <AlertsSection />
            <FaqSection />
            <FinalCtaSection />
        </article>
    );
}

function HeroSection() {
    const { t } = useTranslation();

    return (
        <section className="relative overflow-hidden bg-surface-container-low px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <div className="absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,var(--surface-bright)_0%,rgba(247,244,233,0)_100%)]" />
            <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.7fr)] lg:items-center">
                <div>
                    <p className="mb-5 inline-flex bg-secondary-container px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-on-secondary-container">
                        {t(getBarnebysComparisonTranslationKey("hero.eyebrow"))}
                    </p>
                    <H1 className="max-w-4xl text-5xl font-normal leading-[0.95] tracking-[-0.04em] text-primary sm:text-6xl lg:text-7xl">
                        {t(getBarnebysComparisonTranslationKey("hero.title"))}
                    </H1>
                    <p className="mt-7 max-w-2xl text-lg leading-8 text-on-surface-variant">
                        {t(getBarnebysComparisonTranslationKey("hero.subtitle"))}
                    </p>
                    <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                        <Button
                            asChild
                            size="lg"
                            className="min-h-11 bg-[linear-gradient(180deg,var(--primary)_0%,var(--primary-container)_100%)] px-6 text-primary-foreground shadow-none hover:opacity-95"
                        >
                            <Link to="/">
                                {t(getBarnebysComparisonTranslationKey("hero.primaryCta"))}
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="min-h-11 border-outline-variant/20 bg-transparent px-6 text-primary shadow-none hover:bg-primary/8"
                        >
                            <a href="#scorecard">
                                {t(getBarnebysComparisonTranslationKey("hero.secondaryCta"))}
                            </a>
                        </Button>
                    </div>
                </div>

                <aside className="bg-background/80 p-6 shadow-[0_12px_40px_rgba(28,28,22,0.06)] backdrop-blur-xl sm:p-8">
                    <div className="flex items-start gap-4">
                        <div className="flex size-12 shrink-0 items-center justify-center bg-tertiary-fixed text-primary">
                            <Sparkles className="size-5" aria-hidden="true" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-tertiary">
                                {t(getBarnebysComparisonTranslationKey("hero.quickAnswerEyebrow"))}
                            </p>
                            <H2 className="mt-3 text-3xl leading-9 text-primary-container">
                                {t(getBarnebysComparisonTranslationKey("hero.quickAnswerTitle"))}
                            </H2>
                        </div>
                    </div>
                    <dl className="mt-8 space-y-3">
                        {QUICK_VERDICT_KEYS.map((item) => (
                            <div
                                key={item.key}
                                className="grid gap-3 bg-surface-container-lowest p-4 sm:grid-cols-[1fr_auto] sm:items-center"
                            >
                                <dt className="text-sm leading-6 text-on-surface-variant">
                                    {t(
                                        getBarnebysComparisonTranslationKey(
                                            `quickVerdicts.${item.key}.label`,
                                        ),
                                    )}
                                </dt>
                                <dd>
                                    <VerdictBadge tone={item.tone}>
                                        {t(
                                            getBarnebysComparisonTranslationKey(
                                                `quickVerdicts.${item.key}.value`,
                                            ),
                                        )}
                                    </VerdictBadge>
                                </dd>
                            </div>
                        ))}
                    </dl>
                    <p className="mt-6 text-sm leading-6 text-on-surface-variant">
                        {t(getBarnebysComparisonTranslationKey("hero.quickAnswerDescription"))}
                    </p>
                </aside>
            </div>
        </section>
    );
}

function SummarySection() {
    const { t } = useTranslation();

    return (
        <section className="px-4 py-14 sm:px-6 lg:px-8" aria-labelledby="summary-heading">
            <div className="mx-auto max-w-7xl bg-surface-container-lowest p-6 shadow-[0_12px_40px_rgba(28,28,22,0.06)] sm:p-8 lg:grid lg:grid-cols-[0.8fr_1.2fr] lg:gap-10">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-tertiary">
                        {t(getBarnebysComparisonTranslationKey("summary.eyebrow"))}
                    </p>
                    <H2 id="summary-heading" className="mt-3 text-3xl text-primary-container">
                        {t(getBarnebysComparisonTranslationKey("summary.title"))}
                    </H2>
                </div>
                <div className="mt-6 space-y-4 text-base leading-7 text-on-surface-variant lg:mt-0">
                    <p>{t(getBarnebysComparisonTranslationKey("summary.paragraph1"))}</p>
                    <p>{t(getBarnebysComparisonTranslationKey("summary.paragraph2"))}</p>
                </div>
            </div>
        </section>
    );
}

function RespectSection() {
    const { t } = useTranslation();

    return (
        <section className="bg-surface-bright px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                <div className="lg:pt-8">
                    <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-tertiary">
                        {t(getBarnebysComparisonTranslationKey("respect.eyebrow"))}
                    </p>
                    <H2 className="text-4xl leading-tight text-primary">
                        {t(getBarnebysComparisonTranslationKey("respect.title"))}
                    </H2>
                </div>
                <div className="space-y-5 bg-surface-container-low p-6 text-lg leading-8 text-on-surface-variant sm:p-8">
                    <p>{t(getBarnebysComparisonTranslationKey("respect.paragraph1"))}</p>
                    <p>{t(getBarnebysComparisonTranslationKey("respect.paragraph2"))}</p>
                </div>
            </div>
        </section>
    );
}

function AdvantageSection() {
    const { t } = useTranslation();

    return (
        <section className="bg-surface-container-low px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="max-w-3xl">
                    <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-tertiary">
                        {t(getBarnebysComparisonTranslationKey("advantages.eyebrow"))}
                    </p>
                    <H2 className="text-4xl leading-tight text-primary">
                        {t(getBarnebysComparisonTranslationKey("advantages.title"))}
                    </H2>
                    <p className="mt-5 text-lg leading-8 text-on-surface-variant">
                        {t(getBarnebysComparisonTranslationKey("advantages.description"))}
                    </p>
                </div>

                <div className="mt-12 grid gap-6 md:grid-cols-2">
                    {AURA_ADVANTAGES.map((advantage) => (
                        <FeaturePanel
                            key={advantage.key}
                            feature={advantage}
                            translationPath="advantages.cards"
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

function ScorecardSection() {
    const { t } = useTranslation();

    return (
        <section
            id="scorecard"
            className="scroll-mt-24 bg-background px-4 py-20 sm:px-6 lg:px-8"
            aria-labelledby="scorecard-heading"
        >
            <div className="mx-auto max-w-7xl">
                <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
                    <div>
                        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-tertiary">
                            {t(getBarnebysComparisonTranslationKey("scorecard.eyebrow"))}
                        </p>
                        <H2 id="scorecard-heading" className="text-4xl leading-tight text-primary">
                            {t(getBarnebysComparisonTranslationKey("scorecard.title"))}
                        </H2>
                    </div>
                    <p className="text-lg leading-8 text-on-surface-variant">
                        {t(getBarnebysComparisonTranslationKey("scorecard.description"))}
                    </p>
                </div>

                <div className="mt-10 overflow-x-auto">
                    <table className="w-full min-w-248 border-separate border-spacing-y-3 text-left">
                        <caption className="sr-only">
                            {t(getBarnebysComparisonTranslationKey("scorecard.caption"))}
                        </caption>
                        <thead>
                            <tr className="text-sm uppercase tracking-[0.18em] text-tertiary">
                                <th scope="col" className="px-5 pb-2 font-semibold">
                                    {t(
                                        getBarnebysComparisonTranslationKey(
                                            "scorecard.headers.criterion",
                                        ),
                                    )}
                                </th>
                                <th scope="col" className="px-5 pb-2 font-semibold">
                                    {t(
                                        getBarnebysComparisonTranslationKey(
                                            "scorecard.headers.barnebys",
                                        ),
                                    )}
                                </th>
                                <th scope="col" className="px-5 pb-2 font-semibold">
                                    {t(
                                        getBarnebysComparisonTranslationKey(
                                            "scorecard.headers.auraHistoria",
                                        ),
                                    )}
                                </th>
                                <th scope="col" className="px-5 pb-2 font-semibold">
                                    {t(
                                        getBarnebysComparisonTranslationKey(
                                            "scorecard.headers.practicalEdge",
                                        ),
                                    )}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {COMPARISON_ROWS.map((row) => (
                                <tr key={row.key}>
                                    <th
                                        scope="row"
                                        className="bg-surface-container-high px-5 py-5 align-top font-display text-xl font-normal text-primary"
                                    >
                                        {t(
                                            getBarnebysComparisonTranslationKey(
                                                `scorecard.rows.${row.key}.criterion`,
                                            ),
                                        )}
                                    </th>
                                    <td className="bg-surface-container-lowest px-5 py-5 align-top text-sm leading-6 text-on-surface-variant">
                                        {t(
                                            getBarnebysComparisonTranslationKey(
                                                `scorecard.rows.${row.key}.barnebys`,
                                            ),
                                        )}
                                    </td>
                                    <td className="bg-surface-container-lowest px-5 py-5 align-top text-sm leading-6 text-on-surface-variant">
                                        {t(
                                            getBarnebysComparisonTranslationKey(
                                                `scorecard.rows.${row.key}.auraHistoria`,
                                            ),
                                        )}
                                    </td>
                                    <td className="bg-surface-container-low px-5 py-5 align-top">
                                        <VerdictBadge tone={row.tone}>
                                            {t(
                                                getBarnebysComparisonTranslationKey(
                                                    `scorecard.rows.${row.key}.verdict`,
                                                ),
                                            )}
                                        </VerdictBadge>
                                        <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                                            {t(
                                                getBarnebysComparisonTranslationKey(
                                                    `scorecard.rows.${row.key}.whyItMatters`,
                                                ),
                                            )}
                                        </p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}

function DownstreamSection() {
    const { t } = useTranslation();

    return (
        <section className="bg-surface-container-low px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
                    <div>
                        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-tertiary">
                            {t(getBarnebysComparisonTranslationKey("downstream.eyebrow"))}
                        </p>
                        <H2 className="text-4xl leading-tight text-primary">
                            {t(getBarnebysComparisonTranslationKey("downstream.title"))}
                        </H2>
                        <div className="mt-7 flex flex-wrap gap-2">
                            {MARKET_SOURCE_KEYS.map((sourceKey) => (
                                <span
                                    key={sourceKey}
                                    className="bg-secondary-container px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] text-on-secondary-container"
                                >
                                    {t(
                                        getBarnebysComparisonTranslationKey(
                                            `downstream.sources.${sourceKey}`,
                                        ),
                                    )}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                        {DOWNSTREAM_ADVANTAGES.map((advantage) => (
                            <FeaturePanel
                                key={advantage.key}
                                feature={advantage}
                                translationPath="downstream.cards"
                                compact
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function AlertsSection() {
    const { t } = useTranslation();

    return (
        <section className="bg-surface-bright px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl bg-background/80 p-6 shadow-[0_12px_40px_rgba(28,28,22,0.06)] backdrop-blur-xl sm:p-10">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                    <div className="flex size-14 shrink-0 items-center justify-center bg-tertiary-fixed text-primary">
                        <Bell className="size-6" aria-hidden="true" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-tertiary">
                            {t(getBarnebysComparisonTranslationKey("alerts.eyebrow"))}
                        </p>
                        <H2 className="mt-3 text-4xl leading-tight text-primary">
                            {t(getBarnebysComparisonTranslationKey("alerts.title"))}
                        </H2>
                        <div className="mt-6 space-y-4 text-lg leading-8 text-on-surface-variant">
                            <p>{t(getBarnebysComparisonTranslationKey("alerts.paragraph1"))}</p>
                            <p>{t(getBarnebysComparisonTranslationKey("alerts.paragraph2"))}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function FaqSection() {
    const { t } = useTranslation();

    return (
        <section className="bg-background px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="faq-heading">
            <div className="mx-auto max-w-4xl">
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-tertiary">
                    {t(getBarnebysComparisonTranslationKey("faq.eyebrow"))}
                </p>
                <H2 id="faq-heading" className="text-4xl leading-tight text-primary">
                    {t(getBarnebysComparisonTranslationKey("faq.title"))}
                </H2>
                <div className="mt-10 space-y-5">
                    {BARNEBYS_COMPARISON_FAQ_KEYS.map((faqKey) => (
                        <section key={faqKey} className="bg-surface-container-low p-6 sm:p-7">
                            <H3 className="text-2xl text-primary-container">
                                {t(
                                    getBarnebysComparisonTranslationKey(
                                        `faq.items.${faqKey}.question`,
                                    ),
                                )}
                            </H3>
                            <p className="mt-3 text-base leading-7 text-on-surface-variant">
                                {t(
                                    getBarnebysComparisonTranslationKey(
                                        `faq.items.${faqKey}.answer`,
                                    ),
                                )}
                            </p>
                        </section>
                    ))}
                </div>
            </div>
        </section>
    );
}

function FinalCtaSection() {
    const { t } = useTranslation();

    return (
        <section className="bg-surface-container-low px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl bg-surface-container-lowest p-6 shadow-[0_12px_40px_rgba(28,28,22,0.06)] sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-12">
                <div className="max-w-3xl">
                    <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-tertiary">
                        {t(getBarnebysComparisonTranslationKey("finalCta.eyebrow"))}
                    </p>
                    <H2 className="text-4xl leading-tight text-primary">
                        {t(getBarnebysComparisonTranslationKey("finalCta.title"))}
                    </H2>
                    <p className="mt-5 text-lg leading-8 text-on-surface-variant">
                        {t(getBarnebysComparisonTranslationKey("finalCta.description"))}
                    </p>
                </div>
                <Button
                    asChild
                    size="lg"
                    className="mt-8 min-h-11 bg-[linear-gradient(180deg,var(--primary)_0%,var(--primary-container)_100%)] px-6 text-primary-foreground shadow-none hover:opacity-95 lg:mt-0"
                >
                    <Link to="/">{t(getBarnebysComparisonTranslationKey("finalCta.button"))}</Link>
                </Button>
            </div>
        </section>
    );
}

function FeaturePanel({
    feature,
    translationPath,
    compact = false,
}: {
    readonly feature: FeatureCard;
    readonly translationPath: string;
    readonly compact?: boolean;
}) {
    const { t } = useTranslation();

    return (
        <div className={cn("bg-surface-container-lowest p-6", !compact && "sm:p-8")}>
            <div className="flex size-12 items-center justify-center bg-surface-container-high text-primary">
                <feature.icon className="size-5" aria-hidden="true" />
            </div>
            <H3 className={cn("mt-5 text-primary-container", compact ? "text-xl" : "text-2xl")}>
                {t(getBarnebysComparisonTranslationKey(`${translationPath}.${feature.key}.title`))}
            </H3>
            <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                {t(
                    getBarnebysComparisonTranslationKey(
                        `${translationPath}.${feature.key}.description`,
                    ),
                )}
            </p>
        </div>
    );
}

function VerdictBadge({
    tone,
    children,
}: {
    readonly tone: VerdictTone;
    readonly children: React.ReactNode;
}) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em]",
                tone === "aura" && "bg-tertiary-fixed text-primary",
                tone === "barnebys" && "bg-secondary-container text-on-secondary-container",
            )}
        >
            {tone === "aura" && <CheckCircle2 className="size-3.5" aria-hidden="true" />}
            {children}
        </span>
    );
}
