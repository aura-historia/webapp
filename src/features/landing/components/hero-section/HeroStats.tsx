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

// Phones: a compact grid of up to three columns (3 × 2 for six). From 640px: the same grid. From
// 1024px: one row, as wide as the headline, so the strip keeps a single row's height under the
// longer hero. Figures at zero are left out, so the columns follow how many figures remain.
const LIST_CLASS =
    "mt-2 grid w-full border-t border-line sm:mt-7 sm:max-w-[880px] lg:max-w-[1100px]";
// Each cell reserves a figure line and two label lines, so every row keeps its height whether or
// not a label wraps, and centres its figure and label in that height:
//   phones:  14px + 26.4px figure + 4px gap + 28px (2 × 10px × 1.4) + 14px + 1px rule = 87.4px
//   ≥ 640px: 22px + 37.4px figure + 6px gap + 30.8px (2 × 11px × 1.4) + 22px + 1px rule = 119.2px
const ITEM_CLASS =
    "flex min-h-[87.4px] flex-col justify-center gap-1 border-b border-line py-3.5 sm:min-h-[119.2px] sm:gap-1.5 sm:px-4 sm:py-[22px] lg:px-3";
// Cells after the first in a row carry a left rule. The first cell of a row has none (and, on
// phones, no left padding); from 1024px the figures share one row, so only the very first cell
// keeps that.
const INNER_CELL_CLASS = "border-l px-2.5";
const FIRST_CELL_CLASS = "pl-0 pr-2.5";
const WRAPPED_ROW_START_CLASS = `${FIRST_CELL_CLASS} lg:border-l`;

/** Columns below 1024px: one row for up to three figures, 2 × 2 for four, otherwise rows of three. */
function columnsBelowLg(count: number): number {
    if (count <= 3) return Math.max(count, 1);
    return count === 4 ? 2 : 3;
}

const COLUMNS_CLASS: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
};

const LG_COLUMNS_CLASS: Record<number, string> = {
    1: "lg:grid-cols-1",
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
    5: "lg:grid-cols-5",
    6: "lg:grid-cols-6",
};

function listClass(count: number): string {
    return `${LIST_CLASS} ${COLUMNS_CLASS[columnsBelowLg(count)]} ${LG_COLUMNS_CLASS[Math.max(count, 1)]}`;
}

function itemClass(index: number, count: number): string {
    if (index === 0) return `${ITEM_CLASS} ${FIRST_CELL_CLASS}`;
    if (index % columnsBelowLg(count) === 0) return `${ITEM_CLASS} ${WRAPPED_ROW_START_CLASS}`;
    return `${ITEM_CLASS} ${INNER_CELL_CLASS}`;
}

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
    // A figure at zero says nothing yet (no auction houses indexed, say), so it is left out.
    const stats = STAT_KEYS.map((key) => ({ key, value: statValue(overview, key) })).filter(
        ({ value }) => value > 0,
    );

    if (stats.length === 0) return null;

    return (
        <dl className={listClass(stats.length)}>
            {stats.map(({ key, value }, index) => (
                <div key={key} className={itemClass(index, stats.length)}>
                    {/* Labels agree with their figure ("1 Country", "18 Countries"). */}
                    <dt className={LABEL_CLASS}>
                        {t(`landingPage.hero.stats.${key}`, {
                            count: value,
                        })}
                    </dt>
                    <dd className={FIGURE_CLASS}>{formatStat(key, value, i18n.language)}</dd>
                </div>
            ))}
        </dl>
    );
}

/**
 * Reserves the strip's height while the counts load after mount. The label bar is one line high,
 * like most labels, so the centred figure does not move when the counts arrive.
 */
export function HeroStatsSkeleton() {
    return (
        <div aria-hidden="true" className={listClass(STAT_KEYS.length)}>
            {STAT_KEYS.map((key, index) => (
                <div key={key} className={itemClass(index, STAT_KEYS.length)}>
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
 * then live objects and countries, from the public overview. Figures at zero are left out.
 * Loaded after mount only, so prerendered HTML never carries stale counts.
 */
export function HeroStats() {
    return (
        <ClientOnly fallback={<HeroStatsSkeleton />}>
            <HeroStatsContent />
        </ClientOnly>
    );
}
