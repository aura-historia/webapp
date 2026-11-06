import { ClientOnly } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import type { PublicOverview } from "@/data/internal/overview/PublicOverview.ts";
import { usePublicOverview } from "@/features/landing/hooks/usePublicOverview.ts";

/** Indexed sources by type first, then the catalogue's reach. */
const STAT_KEYS = [
    "dealers",
    "auctionHouses",
    "auctionPlatforms",
    "marketplaces",
    "liveObjects",
    "countries",
] as const;

type StatKey = (typeof STAT_KEYS)[number];

/** From a million, live objects read as "1.8M"; below that every figure is exact. */
const COMPACT_FROM = 1_000_000;

// Phones: a 2 × 3 grid, ruled below each cell. From 640px: a 3 × 2 grid, hairlines between.
const LIST_CLASS =
    "mt-2 grid w-full grid-cols-2 border-t border-line sm:mt-7 sm:max-w-[880px] sm:grid-cols-3";
const ITEM_CLASS =
    "flex flex-col gap-1 border-b border-line py-[18px] pr-3 even:border-l even:pr-0 even:pl-4 sm:gap-1.5 sm:border-l sm:px-4 sm:py-[22px] sm:even:px-4 sm:nth-[3n+1]:border-l-0";
const LABEL_CLASS =
    "order-2 font-mono text-[10px] leading-[1.4] tracking-[0.14em] text-ink-muted uppercase sm:text-label";
const FIGURE_CLASS = "order-1 font-serif text-[30px] leading-[1.1] sm:text-stat";

function statValue(overview: PublicOverview, key: StatKey): number {
    if (key === "liveObjects" || key === "countries") return overview[key];
    return overview.sourcesIndexedByType[key];
}

function formatStat(key: StatKey, value: number, language: string): string {
    const compact = key === "liveObjects" && value >= COMPACT_FROM;
    return new Intl.NumberFormat(
        language,
        compact ? { notation: "compact", maximumFractionDigits: 1 } : undefined,
    ).format(value);
}

function HeroStatList({ overview }: { readonly overview: PublicOverview }) {
    const { t, i18n } = useTranslation();

    return (
        <dl className={LIST_CLASS}>
            {STAT_KEYS.map((key) => {
                const value = statValue(overview, key);
                return (
                    <div key={key} className={ITEM_CLASS}>
                        {/* Labels agree with their figure ("1 Country", "18 Countries"). */}
                        <dt className={LABEL_CLASS}>
                            {t(`landingPage.hero.stats.${key}`, {
                                count: value,
                            })}
                        </dt>
                        <dd className={FIGURE_CLASS}>{formatStat(key, value, i18n.language)}</dd>
                    </div>
                );
            })}
        </dl>
    );
}

/** Reserves the strip's height while the counts load after mount. */
export function HeroStatsSkeleton() {
    return (
        <div aria-hidden="true" className={LIST_CLASS}>
            {STAT_KEYS.map((key) => (
                <div key={key} className={ITEM_CLASS}>
                    <div className="order-2 h-3.5 w-24 rounded-xs bg-line-subtle sm:self-center" />
                    <div className="order-1 h-[33px] w-16 animate-pulse rounded-xs bg-line-subtle sm:h-[37px] sm:self-center" />
                </div>
            ))}
        </div>
    );
}

function HeroStatsContent() {
    const { data: overview, isPending } = usePublicOverview();

    if (isPending) return <HeroStatsSkeleton />;
    // No confirmed figures, no strip: never show placeholders or zeros from a failed read.
    if (!overview) return null;

    return <HeroStatList overview={overview} />;
}

/**
 * The hero's scale strip: indexed dealers, auction houses, auction platforms and marketplaces,
 * then live objects and countries, from the public overview. Loaded after mount only, so
 * prerendered HTML never carries stale counts.
 */
export function HeroStats() {
    return (
        <ClientOnly fallback={<HeroStatsSkeleton />}>
            <HeroStatsContent />
        </ClientOnly>
    );
}
