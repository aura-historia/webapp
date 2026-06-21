import { Button } from "@/components/ui/button.tsx";
import { H1 } from "@/components/typography/H1.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { H3 } from "@/components/typography/H3.tsx";
import { cn } from "@/lib/utils.ts";
import { Link } from "@tanstack/react-router";
import type React from "react";
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

export const BARNEBYS_COMPARISON_TITLE = "Aura Historia vs Barnebys";
export const BARNEBYS_COMPARISON_DESCRIPTION =
    "A fair comparison of Aura Historia and Barnebys for antiques search, source coverage, multilingual discovery, alerts, and AI-assisted market monitoring.";

const MARKET_SOURCES = [
    "Auction houses",
    "Auction platforms",
    "Antique dealers",
    "Private sellers",
    "Marketplaces",
] as const;

type VerdictTone = "aura" | "barnebys" | "context";

type ComparisonRow = {
    readonly criterion: string;
    readonly barnebys: string;
    readonly auraHistoria: string;
    readonly whyItMatters: string;
    readonly verdict: string;
    readonly tone: VerdictTone;
};

type FeatureCard = {
    readonly icon: LucideIcon;
    readonly title: string;
    readonly description: string;
};

const QUICK_VERDICTS = [
    {
        label: "Best for established auction-house discovery",
        value: "Barnebys",
        tone: "barnebys",
    },
    {
        label: "Best for market-wide antiques search",
        value: "Aura Historia",
        tone: "aura",
    },
    {
        label: "Best for multilingual discovery",
        value: "Aura Historia",
        tone: "aura",
    },
    {
        label: "Best for near real-time monitoring",
        value: "Aura Historia",
        tone: "aura",
    },
] satisfies Array<{
    readonly label: string;
    readonly value: string;
    readonly tone: VerdictTone;
}>;

const AURA_ADVANTAGES: FeatureCard[] = [
    {
        icon: Store,
        title: "The market beyond auction catalogues",
        description:
            "Aura Historia is built to index the online places antiques are actually sold: auction houses, auction platforms, specialist dealers, private sellers, marketplaces, and more.",
    },
    {
        icon: Bell,
        title: "Near real-time alerts",
        description:
            "For rare pieces, a day can matter. Aura Historia monitors new listings, price changes, and availability close to when they happen instead of relying on a single daily alert rhythm.",
    },
    {
        icon: Languages,
        title: "Search without language penalties",
        description:
            "Listings are translated and terminology is aligned across supported languages, so an English, German, French, Spanish, or Italian search can find the same underlying objects.",
    },
    {
        icon: BrainCircuit,
        title: "AI-forward matching",
        description:
            "We are building on modern AI, semantic search, and multilingual normalization so saved searches can become more precise without becoming narrower.",
    },
];

const COMPARISON_ROWS: ComparisonRow[] = [
    {
        criterion: "Auction-house heritage",
        barnebys:
            "A long-established name in antiques auction aggregation with broad recognition among auction-focused buyers.",
        auraHistoria:
            "A newer search engine built from day one around a wider source model and modern data enrichment.",
        whyItMatters:
            "If you mainly browse major auction catalogues, Barnebys has a familiar, proven position.",
        verdict: "Barnebys for legacy recognition",
        tone: "barnebys",
    },
    {
        criterion: "Source coverage",
        barnebys:
            "Strongest around auction houses and auction platforms, particularly established catalogues.",
        auraHistoria:
            "Indexes auction houses, auction platforms, dealers, private sellers, marketplaces, and other online sources where antiques appear.",
        whyItMatters:
            "Many valuable finds never start in a major auction catalogue. Broader coverage creates broader opportunity.",
        verdict: "Aura Historia",
        tone: "aura",
    },
    {
        criterion: "Alert speed",
        barnebys:
            "Search alerts follow a daily check pattern, including the known 18:00 CEST alert window.",
        auraHistoria:
            "Near real-time monitoring for newly discovered listings plus price and availability changes.",
        whyItMatters:
            "The earlier a buyer sees a rare item, the more options they have before it is reserved, sold, or bid up.",
        verdict: "Aura Historia",
        tone: "aura",
    },
    {
        criterion: "Language handling",
        barnebys:
            "Often keeps listing text close to the native source language and source terminology.",
        auraHistoria:
            "Translates listings into multiple languages and aligns antique terminology across languages.",
        whyItMatters:
            "The language of a seller should not decide whether a collector can discover the object.",
        verdict: "Aura Historia",
        tone: "aura",
    },
    {
        criterion: "Alert relevance",
        barnebys:
            "Useful for broad auction watches, while broader keyword matching can occasionally bring adjacent lots into the inbox.",
        auraHistoria:
            "Designed around normalized item data and tighter matching so alerts can be both broader in coverage and more selective in relevance.",
        whyItMatters:
            "Collectors need signal, not just volume. Every notification should be worth opening.",
        verdict: "Aura Historia",
        tone: "aura",
    },
    {
        criterion: "Technology direction",
        barnebys: "A mature auction-search experience for buyers who know the auction ecosystem.",
        auraHistoria:
            "An AI-forward search layer for the whole antiques market, combining indexing, translations, semantic matching, and monitoring.",
        whyItMatters:
            "Modern discovery is not only about having data; it is about understanding what a buyer means across languages and sources.",
        verdict: "Aura Historia",
        tone: "aura",
    },
];

const DOWNSTREAM_ADVANTAGES: FeatureCard[] = [
    {
        icon: Telescope,
        title: "Find under-the-radar inventory",
        description:
            "Small dealers, niche marketplaces, and private sellers can list exceptional objects long before they surface in a major auction channel.",
    },
    {
        icon: SearchCheck,
        title: "Compare the real market",
        description:
            "Auction estimates tell one story. Dealer asking prices, marketplace listings, and recent availability changes make the market picture more complete.",
    },
    {
        icon: Clock3,
        title: "Act before the daily digest",
        description:
            "Near real-time monitoring is built for scarce inventory where the best moment to decide is often the moment a listing appears.",
    },
    {
        icon: Globe2,
        title: "Search across borders",
        description:
            "When terminology is translated and aligned, a collector is no longer limited by the language used by the seller or auctioneer.",
    },
];

export const BARNEBYS_COMPARISON_FAQS = [
    {
        question: "Is Aura Historia a Barnebys alternative?",
        answer: "Yes. Aura Historia is a Barnebys alternative for buyers who want to search beyond auction-house aggregation and monitor auction houses, dealers, marketplaces, private sellers, and other online antiques sources in one place.",
    },
    {
        question: "Does Aura Historia replace Barnebys?",
        answer: "If you only want a familiar way to browse established auction-house catalogues, Barnebys remains a respected option. If you want broader online antiques coverage, multilingual discovery, near real-time alerts, and AI-assisted matching, Aura Historia is designed to be the stronger choice.",
    },
    {
        question: "Which service has faster antiques alerts?",
        answer: "Aura Historia is designed for near real-time monitoring. Barnebys search alerts follow a daily check pattern, including the known 18:00 CEST alert window.",
    },
    {
        question: "Which service is better for multilingual antiques search?",
        answer: "Aura Historia is built to translate listings and align terminology across supported languages. That means the search language should matter less, whether the original listing is in English, German, French, Spanish, Italian, or another source language.",
    },
    {
        question: "Which service is better for finding antiques outside auctions?",
        answer: "Aura Historia. Its core advantage is broader source coverage: auction houses, auction platforms, dealers, private sellers, marketplaces, and other online places where antiques are sold.",
    },
] as const;

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
    return (
        <section className="relative overflow-hidden bg-surface-container-low px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <div className="absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,var(--surface-bright)_0%,rgba(247,244,233,0)_100%)]" />
            <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.7fr)] lg:items-center">
                <div>
                    <p className="mb-5 inline-flex bg-secondary-container px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-on-secondary-container">
                        Comparison: Aura Historia vs Barnebys
                    </p>
                    <H1 className="max-w-4xl text-5xl font-normal leading-[0.95] tracking-[-0.04em] text-primary sm:text-6xl lg:text-7xl">
                        A broader antiques search engine than an auction aggregator
                    </H1>
                    <p className="mt-7 max-w-2xl text-lg leading-8 text-on-surface-variant">
                        Barnebys helped make auction-house catalogues easier to search. Aura
                        Historia starts from a wider premise: serious collectors should see the
                        whole online antiques market, not only the best-known auction stream.
                    </p>
                    <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                        <Button
                            asChild
                            size="lg"
                            className="min-h-11 bg-[linear-gradient(180deg,var(--primary)_0%,var(--primary-container)_100%)] px-6 text-primary-foreground shadow-none hover:opacity-95"
                        >
                            <Link to="/search">Search the wider market</Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="min-h-11 border-outline-variant/20 bg-transparent px-6 text-primary shadow-none hover:bg-primary/8"
                        >
                            <a href="#scorecard">See the scorecard</a>
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
                                Quick answer
                            </p>
                            <H2 className="mt-3 text-3xl leading-9 text-primary-container">
                                Barnebys is respected. Aura Historia is broader.
                            </H2>
                        </div>
                    </div>
                    <dl className="mt-8 space-y-3">
                        {QUICK_VERDICTS.map((item) => (
                            <div
                                key={item.label}
                                className="grid gap-3 bg-surface-container-lowest p-4 sm:grid-cols-[1fr_auto] sm:items-center"
                            >
                                <dt className="text-sm leading-6 text-on-surface-variant">
                                    {item.label}
                                </dt>
                                <dd>
                                    <VerdictBadge tone={item.tone}>{item.value}</VerdictBadge>
                                </dd>
                            </div>
                        ))}
                    </dl>
                    <p className="mt-6 text-sm leading-6 text-on-surface-variant">
                        Verdict: choose Barnebys for familiar auction-house browsing. Choose Aura
                        Historia when you want auction houses, dealers, marketplaces, private
                        sellers, translations, and near real-time monitoring in one search layer.
                    </p>
                </aside>
            </div>
        </section>
    );
}

function SummarySection() {
    return (
        <section className="px-4 py-14 sm:px-6 lg:px-8" aria-labelledby="summary-heading">
            <div className="mx-auto max-w-7xl bg-surface-container-lowest p-6 shadow-[0_12px_40px_rgba(28,28,22,0.06)] sm:p-8 lg:grid lg:grid-cols-[0.8fr_1.2fr] lg:gap-10">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-tertiary">
                        Summary
                    </p>
                    <H2 id="summary-heading" className="mt-3 text-3xl text-primary-container">
                        The short version
                    </H2>
                </div>
                <div className="mt-6 space-y-4 text-base leading-7 text-on-surface-variant lg:mt-0">
                    <p>
                        Aura Historia is the better Barnebys alternative for collectors, dealers,
                        researchers, and AI agents that need broad antiques discovery rather than
                        auction aggregation alone.
                    </p>
                    <p>
                        Barnebys deserves credit for its history in auction search. Aura Historia
                        wins the practical comparison by indexing more source types, translating and
                        normalizing listing text, monitoring changes near real-time, and building on
                        modern AI-assisted search.
                    </p>
                </div>
            </div>
        </section>
    );
}

function RespectSection() {
    return (
        <section className="bg-surface-bright px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                <div className="lg:pt-8">
                    <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-tertiary">
                        Respect where it is due
                    </p>
                    <H2 className="text-4xl leading-tight text-primary">
                        Barnebys helped define auction aggregation
                    </H2>
                </div>
                <div className="space-y-5 bg-surface-container-low p-6 text-lg leading-8 text-on-surface-variant sm:p-8">
                    <p>
                        A fair comparison should start here: Barnebys is a known name in the
                        antiques auction world. For many buyers, it made scattered auction-house
                        catalogues feel more searchable and approachable.
                    </p>
                    <p>
                        That is useful. It is also not the same as seeing the whole online market.
                        The objects collectors want are spread across major auction houses, regional
                        auctioneers, specialist dealers, independent shops, marketplaces, and
                        sometimes private sellers. Aura Historia is designed for that wider reality.
                    </p>
                </div>
            </div>
        </section>
    );
}

function AdvantageSection() {
    return (
        <section className="bg-surface-container-low px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="max-w-3xl">
                    <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-tertiary">
                        Where Aura Historia is designed to win
                    </p>
                    <H2 className="text-4xl leading-tight text-primary">
                        More sources, faster signals, fewer language barriers
                    </H2>
                    <p className="mt-5 text-lg leading-8 text-on-surface-variant">
                        The core difference is not a single feature. It is the compounding advantage
                        of a broader index paired with cleaner data and faster alerts.
                    </p>
                </div>

                <div className="mt-12 grid gap-6 md:grid-cols-2">
                    {AURA_ADVANTAGES.map((advantage) => (
                        <FeaturePanel key={advantage.title} feature={advantage} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function ScorecardSection() {
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
                            The comparison table
                        </p>
                        <H2 id="scorecard-heading" className="text-4xl leading-tight text-primary">
                            Aura Historia vs Barnebys, side by side
                        </H2>
                    </div>
                    <p className="text-lg leading-8 text-on-surface-variant">
                        Barnebys keeps a clear place for auction-focused discovery. Aura Historia is
                        built for buyers who want the wider antiques market and a more modern
                        monitoring layer.
                    </p>
                </div>

                <div className="mt-10 overflow-x-auto">
                    <table className="w-full min-w-248 border-separate border-spacing-y-3 text-left">
                        <caption className="sr-only">
                            Comparison of Aura Historia and Barnebys for antiques search
                        </caption>
                        <thead>
                            <tr className="text-sm uppercase tracking-[0.18em] text-tertiary">
                                <th scope="col" className="px-5 pb-2 font-semibold">
                                    Criterion
                                </th>
                                <th scope="col" className="px-5 pb-2 font-semibold">
                                    Barnebys
                                </th>
                                <th scope="col" className="px-5 pb-2 font-semibold">
                                    Aura Historia
                                </th>
                                <th scope="col" className="px-5 pb-2 font-semibold">
                                    Practical edge
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {COMPARISON_ROWS.map((row) => (
                                <tr key={row.criterion}>
                                    <th
                                        scope="row"
                                        className="bg-surface-container-high px-5 py-5 align-top font-display text-xl font-normal text-primary"
                                    >
                                        {row.criterion}
                                    </th>
                                    <td className="bg-surface-container-lowest px-5 py-5 align-top text-sm leading-6 text-on-surface-variant">
                                        {row.barnebys}
                                    </td>
                                    <td className="bg-surface-container-lowest px-5 py-5 align-top text-sm leading-6 text-on-surface-variant">
                                        {row.auraHistoria}
                                    </td>
                                    <td className="bg-surface-container-low px-5 py-5 align-top">
                                        <VerdictBadge tone={row.tone}>{row.verdict}</VerdictBadge>
                                        <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                                            {row.whyItMatters}
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
    return (
        <section className="bg-surface-container-low px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
                    <div>
                        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-tertiary">
                            Why source breadth compounds
                        </p>
                        <H2 className="text-4xl leading-tight text-primary">
                            Covering more than auctions changes what you can know
                        </H2>
                        <div className="mt-7 flex flex-wrap gap-2">
                            {MARKET_SOURCES.map((source) => (
                                <span
                                    key={source}
                                    className="bg-secondary-container px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] text-on-secondary-container"
                                >
                                    {source}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                        {DOWNSTREAM_ADVANTAGES.map((advantage) => (
                            <FeaturePanel key={advantage.title} feature={advantage} compact />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function AlertsSection() {
    return (
        <section className="bg-surface-bright px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl bg-background/80 p-6 shadow-[0_12px_40px_rgba(28,28,22,0.06)] backdrop-blur-xl sm:p-10">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                    <div className="flex size-14 shrink-0 items-center justify-center bg-tertiary-fixed text-primary">
                        <Bell className="size-6" aria-hidden="true" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-tertiary">
                            A polite note on alerts
                        </p>
                        <H2 className="mt-3 text-4xl leading-tight text-primary">
                            A daily digest is tidy. Rare inventory is not tidy.
                        </H2>
                        <div className="mt-6 space-y-4 text-lg leading-8 text-on-surface-variant">
                            <p>
                                Barnebys alerts are a useful way to keep an eye on auction-related
                                searches, especially for broad watches. But a daily alert rhythm can
                                be late for rare pieces, and broad keyword matching can sometimes
                                surface adjacent lots that are not quite what the collector meant.
                            </p>
                            <p>
                                Aura Historia is built for a different standard: near real-time
                                signals, translated terminology, normalized data, and alerts that
                                aim to stay relevant while watching more of the market. If a
                                notification asks for attention, should it not earn it?
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function FaqSection() {
    return (
        <section className="bg-background px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="faq-heading">
            <div className="mx-auto max-w-4xl">
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-tertiary">
                    FAQ
                </p>
                <H2 id="faq-heading" className="text-4xl leading-tight text-primary">
                    Common questions about Aura Historia and Barnebys
                </H2>
                <div className="mt-10 space-y-5">
                    {BARNEBYS_COMPARISON_FAQS.map((faq) => (
                        <section key={faq.question} className="bg-surface-container-low p-6 sm:p-7">
                            <H3 className="text-2xl text-primary-container">{faq.question}</H3>
                            <p className="mt-3 text-base leading-7 text-on-surface-variant">
                                {faq.answer}
                            </p>
                        </section>
                    ))}
                </div>
            </div>
        </section>
    );
}

function FinalCtaSection() {
    return (
        <section className="bg-surface-container-low px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl bg-surface-container-lowest p-6 shadow-[0_12px_40px_rgba(28,28,22,0.06)] sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-12">
                <div className="max-w-3xl">
                    <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-tertiary">
                        Final verdict
                    </p>
                    <H2 className="text-4xl leading-tight text-primary">
                        Barnebys is good for auctions. Aura Historia is built for the antiques
                        market.
                    </H2>
                    <p className="mt-5 text-lg leading-8 text-on-surface-variant">
                        If your search should include the places where antiques are actually sold
                        online, start with Aura Historia.
                    </p>
                </div>
                <Button
                    asChild
                    size="lg"
                    className="mt-8 min-h-11 bg-[linear-gradient(180deg,var(--primary)_0%,var(--primary-container)_100%)] px-6 text-primary-foreground shadow-none hover:opacity-95 lg:mt-0"
                >
                    <Link to="/search">Start searching antiques</Link>
                </Button>
            </div>
        </section>
    );
}

function FeaturePanel({
    feature,
    compact = false,
}: {
    readonly feature: FeatureCard;
    readonly compact?: boolean;
}) {
    return (
        <div className={cn("bg-surface-container-lowest p-6", !compact && "sm:p-8")}>
            <div className="flex size-12 items-center justify-center bg-surface-container-high text-primary">
                <feature.icon className="size-5" aria-hidden="true" />
            </div>
            <H3 className={cn("mt-5 text-primary-container", compact ? "text-xl" : "text-2xl")}>
                {feature.title}
            </H3>
            <p className="mt-3 text-sm leading-6 text-on-surface-variant">{feature.description}</p>
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
                tone === "context" && "bg-surface-container-high text-primary",
            )}
        >
            {tone === "aura" && <CheckCircle2 className="size-3.5" aria-hidden="true" />}
            {children}
        </span>
    );
}
