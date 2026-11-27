import { ClientOnly, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { PublicOverview } from "@/data/internal/overview/PublicOverview.ts";
import { usePublicOverview } from "@/features/landing/hooks/usePublicOverview.ts";
import { PRESS_LABEL_CLASS, PRESS_TEXT_LINK_CLASS } from "@/features/press/lib/pressStyles.ts";

/** The four catalogue figures journalists quote, in order. */
const FIGURES = [
    { key: "liveObjects", value: (overview: PublicOverview) => overview.liveObjects },
    { key: "providers", value: (overview: PublicOverview) => overview.sourcesIndexed },
    { key: "countries", value: (overview: PublicOverview) => overview.countries },
    { key: "languages", value: (overview: PublicOverview) => overview.languages },
] as const;

const LIST_CLASS = "grid grid-cols-2 gap-x-5 sm:gap-x-7 min-[900px]:grid-cols-4";
const CELL_CLASS = "flex flex-col gap-1.5 border-t border-ink pt-5 pb-6";
const FIGURE_CLASS =
    "font-serif text-[30px] leading-none tracking-[-0.01em] sm:text-[clamp(40px,4vw,56px)]";

/** Holds the strip's height while the figures load after mount. */
export function PressCatalogueFiguresSkeleton() {
    return (
        <div aria-hidden="true" className="flex flex-col gap-3">
            <div className={LIST_CLASS}>
                {FIGURES.map(({ key }) => (
                    <div key={key} className={CELL_CLASS}>
                        <div className="h-[30px] w-24 animate-pulse rounded-xs bg-line-subtle motion-reduce:animate-none sm:h-[clamp(40px,4vw,56px)] sm:w-32" />
                        <div className="h-[15px] w-20 rounded-xs bg-line-subtle" />
                    </div>
                ))}
            </div>
            <div className="h-[15px] w-64 max-w-full rounded-xs bg-line-subtle" />
        </div>
    );
}

function FigureList({ overview }: { readonly overview: PublicOverview }) {
    const { t, i18n } = useTranslation();
    const number = new Intl.NumberFormat(i18n.language);
    const date = new Intl.DateTimeFormat(i18n.language, { dateStyle: "long" });
    // A figure at zero says nothing yet, so it is left out, as on the landing page.
    const figures = FIGURES.map(({ key, value }) => ({ key, value: value(overview) })).filter(
        ({ value }) => value > 0,
    );

    if (figures.length === 0) return <FiguresUnavailable />;

    return (
        <div className="flex flex-col gap-3">
            <dl className={LIST_CLASS}>
                {figures.map(({ key, value }) => (
                    <div key={key} className={CELL_CLASS}>
                        <dt className={`order-2 ${PRESS_LABEL_CLASS}`}>
                            {t(`pressPage.facts.figures.${key}`, { count: value })}
                        </dt>
                        <dd className={`order-1 ${FIGURE_CLASS}`}>{number.format(value)}</dd>
                    </div>
                ))}
            </dl>
            <p className={PRESS_LABEL_CLASS}>
                {t("pressPage.facts.figures.asOf", { date: date.format(overview.asOf) })}
            </p>
        </div>
    );
}

function FiguresUnavailable() {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-2 border-t border-ink pt-4">
            <p className="text-body text-ink-secondary">
                {t("pressPage.facts.figures.unavailable")}
            </p>
            <Link to="/$lng" params={true} from="/$lng" className={PRESS_TEXT_LINK_CLASS}>
                {t("pressPage.facts.figures.unavailableLink")}
                <ArrowRight aria-hidden="true" className="size-[15px]" strokeWidth={1.8} />
            </Link>
        </div>
    );
}

function CatalogueFiguresContent() {
    const { data: overview, isPending } = usePublicOverview();

    if (isPending) return <PressCatalogueFiguresSkeleton />;
    // Never placeholders or zeros from a failed read: point to the home page instead.
    if (!overview) return <FiguresUnavailable />;

    return <FigureList overview={overview} />;
}

/**
 * Live objects, providers indexed, countries and listing languages from the public overview, with
 * the date they were counted. Shares the landing page's cached query and, like its stat strip,
 * loads after mount only, so prerendered HTML never carries stale counts.
 */
export function PressCatalogueFigures() {
    return (
        <ClientOnly fallback={<PressCatalogueFiguresSkeleton />}>
            <CatalogueFiguresContent />
        </ClientOnly>
    );
}
