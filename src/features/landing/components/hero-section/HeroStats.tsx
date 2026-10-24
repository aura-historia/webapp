import { ClientOnly } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import type { PublicOverview } from "@/data/internal/overview/PublicOverview.ts";
import { usePublicOverview } from "@/features/landing/hooks/usePublicOverview.ts";

type StatKey = "sourcesIndexed" | "liveObjects" | "countries" | "languages";

const STAT_KEYS: readonly StatKey[] = ["sourcesIndexed", "liveObjects", "countries", "languages"];

/** From a million, live objects read as "1.8M"; below that every figure is exact. */
const COMPACT_FROM = 1_000_000;

// Phones: a 2 × 2 grid, ruled below each cell. From 640px: one ruled row, hairlines between.
const LIST_CLASS =
    "mt-2 grid w-full grid-cols-2 border-t border-line sm:mt-7 sm:flex sm:max-w-[880px] sm:flex-wrap sm:justify-center sm:border-b";
const ITEM_CLASS =
    "flex flex-col gap-1 border-b border-line py-[18px] pr-3 even:border-l even:pr-0 even:pl-4 sm:flex-[1_1_200px] sm:gap-1.5 sm:border-b-0 sm:border-l sm:px-4 sm:py-[22px] sm:first:border-l-0 sm:even:px-4";
const LABEL_CLASS =
    "order-2 font-mono text-[10px] leading-[1.4] tracking-[0.14em] text-ink-muted uppercase sm:text-label";
const FIGURE_CLASS = "order-1 font-serif text-[30px] leading-[1.1] sm:text-stat";

function formatStat(key: StatKey, value: number, language: string): string {
    const compact = key === "liveObjects" && value >= COMPACT_FROM;
    return new Intl.NumberFormat(
        language,
        compact ? { notation: "compact", maximumFractionDigits: 1 } : undefined,
    ).format(value);
}

function StatLabel({ statKey, count }: { readonly statKey: StatKey; readonly count: number }) {
    const { t } = useTranslation();

    // Labels agree with their figure ("1 Country", "18 Countries"). Phones use the shorter
    // "Languages"; the full label returns from 640px.
    if (statKey === "languages") {
        return (
            <dt className={LABEL_CLASS}>
                <span className="sm:hidden">
                    {t("landingPage.hero.stats.languagesShort", { count })}
                </span>
                <span className="hidden sm:inline">
                    {t("landingPage.hero.stats.languages", { count })}
                </span>
            </dt>
        );
    }
    return <dt className={LABEL_CLASS}>{t(`landingPage.hero.stats.${statKey}`, { count })}</dt>;
}

function HeroStatList({ overview }: { readonly overview: PublicOverview }) {
    const { i18n } = useTranslation();

    return (
        <dl className={LIST_CLASS}>
            {STAT_KEYS.map((key) => (
                <div key={key} className={ITEM_CLASS}>
                    <StatLabel statKey={key} count={overview[key]} />
                    <dd className={FIGURE_CLASS}>
                        {formatStat(key, overview[key], i18n.language)}
                    </dd>
                </div>
            ))}
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
 * The hero's scale strip: sources indexed, live objects, countries and languages, from the
 * public overview. Loaded after mount only, so prerendered HTML never carries stale counts.
 */
export function HeroStats() {
    return (
        <ClientOnly fallback={<HeroStatsSkeleton />}>
            <HeroStatsContent />
        </ClientOnly>
    );
}
