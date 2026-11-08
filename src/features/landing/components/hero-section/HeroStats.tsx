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

// Phones: a compact 3 × 2 grid. From 640px: a 3 × 2 grid. From 1024px: one row of six, as wide as
// the headline, so the strip keeps a single row's height under the longer hero.
const LIST_CLASS =
    "mt-2 grid w-full grid-cols-3 border-t border-line sm:mt-7 sm:max-w-[880px] lg:max-w-[1100px] lg:grid-cols-6";
// Each cell reserves a figure line and two label lines, so every row keeps its height whether or
// not a label wraps, and centres its figure and label in that height:
//   phones:  14px + 26.4px figure + 4px gap + 28px (2 × 10px × 1.4) + 14px + 1px rule = 87.4px
//   ≥ 640px: 22px + 37.4px figure + 6px gap + 30.8px (2 × 11px × 1.4) + 22px + 1px rule = 119.2px
const ITEM_CLASS =
    "flex min-h-[87.4px] flex-col justify-center gap-1 border-b border-l border-line px-2.5 py-3.5 nth-[3n+1]:border-l-0 nth-[3n+1]:pl-0 sm:min-h-[119.2px] sm:gap-1.5 sm:px-4 sm:py-[22px] sm:nth-[3n+1]:pl-4 lg:px-3 lg:nth-[3n+1]:pl-3 lg:nth-4:border-l";
const LABEL_CLASS =
    "order-2 font-mono text-[10px] leading-[1.4] tracking-[0.12em] text-ink-muted uppercase text-balance sm:text-label";
const FIGURE_CLASS = "order-1 font-serif text-[24px] leading-[1.1] sm:text-stat";

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

/**
 * Reserves the strip's height while the counts load after mount. The label bar is one line high,
 * like most labels, so the centred figure does not move when the counts arrive.
 */
export function HeroStatsSkeleton() {
    return (
        <div aria-hidden="true" className={LIST_CLASS}>
            {STAT_KEYS.map((key) => (
                <div key={key} className={ITEM_CLASS}>
                    <div className="order-2 flex h-[14px] items-center sm:h-[15.4px] sm:self-center">
                        <div className="h-3 w-16 rounded-xs bg-line-subtle sm:w-24" />
                    </div>
                    <div className="order-1 h-[26px] w-12 animate-pulse rounded-xs bg-line-subtle sm:h-[37px] sm:w-16 sm:self-center" />
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
