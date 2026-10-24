import { ClientOnly, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import type { ProductListing } from "@/data/internal/product/ProductListing.ts";
import { NAV_FOCUS_CLASS } from "@/features/app-shell/components/navigation/navigationConfig.ts";
import {
    HATCHED_PLACEHOLDER_CLASS,
    ObjectCard,
} from "@/features/landing/components/common/ObjectCard.tsx";
import { LandingSection } from "@/features/landing/components/common/LandingSection.tsx";
import {
    HEADLINE_COMPONENTS,
    SectionHeading,
} from "@/features/landing/components/common/SectionHeading.tsx";
import { LANDING_PAGE_FRAGMENTS } from "@/features/landing/config/landingPageFragments.ts";
import {
    RECENTLY_ADDED_COUNT,
    useRecentlyAddedProducts,
} from "@/features/landing/hooks/useRecentlyAddedProducts.ts";
import { cn } from "@/lib/utils.ts";

const CARD_CLASS =
    "shrink-0 snap-start basis-[72%] max-w-[280px] md:max-w-none md:basis-[calc((100%-40px)/3)] xl:basis-[calc((100%-60px)/4)]";

const SKELETON_IDS = ["a", "b", "c", "d"] as const;

function pad(value: number): string {
    return String(value).padStart(2, "0");
}

interface RailState {
    readonly first: number;
    readonly last: number;
    readonly atStart: boolean;
    readonly atEnd: boolean;
    readonly progressLeft: number;
    readonly progressWidth: number;
}

const INITIAL_RAIL: RailState = {
    first: 1,
    last: 1,
    atStart: true,
    atEnd: false,
    progressLeft: 0,
    progressWidth: 25,
};

function measureRail(track: HTMLElement, total: number): RailState {
    const card = track.firstElementChild as HTMLElement | null;
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = card ? card.offsetWidth + gap : track.clientWidth;
    const perView = Math.max(1, Math.round((track.clientWidth + gap) / step));
    const first = Math.min(total, Math.round(track.scrollLeft / step) + 1);
    const last = Math.min(total, first + perView - 1);
    const maxScroll = track.scrollWidth - track.clientWidth;

    return {
        first,
        last,
        atStart: track.scrollLeft <= 1,
        atEnd: track.scrollLeft >= maxScroll - 1,
        progressLeft: ((first - 1) / total) * 100,
        progressWidth: ((last - first + 1) / total) * 100,
    };
}

function RailHeader({
    trackId,
    rail,
    onPage,
}: {
    readonly trackId?: string;
    readonly rail?: RailState;
    readonly onPage?: (direction: -1 | 1) => void;
}) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
                id="latest-heading"
                size="rail"
                eyebrow={t("landingPage.latest.eyebrow")}
                title={
                    <Trans i18nKey="landingPage.latest.title" components={HEADLINE_COMPONENTS} />
                }
            />
            <div className="hidden items-center gap-2.5 md:flex">
                <Link
                    to="/$lng/search"
                    search={{ sortField: "CREATION_DATE", sortOrder: "DESC" }}
                    params={true}
                    from="/$lng"
                    className={cn(
                        "mr-2.5 inline-flex min-h-11 items-center px-1.5 text-[15px] underline underline-offset-4 transition-colors hover:text-brass-ink",
                        NAV_FOCUS_CLASS,
                    )}
                >
                    {t("landingPage.latest.viewAll")}
                </Link>
                <button
                    type="button"
                    aria-label={t("landingPage.latest.previous")}
                    aria-controls={trackId}
                    disabled={!onPage || rail?.atStart}
                    onClick={() => onPage?.(-1)}
                    className={cn(
                        "inline-flex size-12 cursor-pointer items-center justify-center rounded-full text-ink shadow-[inset_0_0_0_1px_var(--line-strong)] transition-opacity disabled:cursor-default disabled:opacity-35",
                        NAV_FOCUS_CLASS,
                    )}
                >
                    <ArrowLeft aria-hidden="true" className="size-[18px]" strokeWidth={1.8} />
                </button>
                <button
                    type="button"
                    data-theme="dark"
                    aria-label={t("landingPage.latest.next")}
                    aria-controls={trackId}
                    disabled={!onPage || rail?.atEnd}
                    onClick={() => onPage?.(1)}
                    className={cn(
                        "inline-flex size-12 cursor-pointer items-center justify-center rounded-full bg-surface text-ink transition-opacity disabled:cursor-default disabled:opacity-35",
                        NAV_FOCUS_CLASS,
                    )}
                >
                    <ArrowRight aria-hidden="true" className="size-[18px]" strokeWidth={1.8} />
                </button>
            </div>
        </div>
    );
}

function ViewAllButton() {
    const { t } = useTranslation();

    return (
        <Link
            to="/$lng/search"
            search={{ sortField: "CREATION_DATE", sortOrder: "DESC" }}
            params={true}
            from="/$lng"
            className={cn(
                "flex h-13 items-center justify-center gap-2.5 rounded-pill text-base text-ink shadow-[inset_0_0_0_1px_var(--line-strong)] md:hidden",
                NAV_FOCUS_CLASS,
            )}
        >
            {t("landingPage.latest.viewAll")}
            <ArrowRight aria-hidden="true" className="size-4" strokeWidth={1.8} />
        </Link>
    );
}

function SectionShell({ children }: { readonly children: React.ReactNode }) {
    return (
        <LandingSection
            ground="surface"
            id={LANDING_PAGE_FRAGMENTS.recentlyAdded}
            labelledBy="latest-heading"
            className="border-b border-line-subtle py-[clamp(64px,8vw,112px)] pb-[clamp(56px,6vw,80px)]"
            containerClassName="flex flex-col gap-6 md:gap-9"
        >
            {children}
        </LandingSection>
    );
}

/** Reserves the rail's layout while the newest listings load after mount. */
export function LatestAcquisitionsSkeleton() {
    return (
        <SectionShell>
            <RailHeader />
            <div
                aria-hidden="true"
                className="-mx-(--page-gutter) flex gap-3 overflow-hidden px-(--page-gutter) md:mx-0 md:gap-5 md:px-0"
            >
                {SKELETON_IDS.map((id) => (
                    <div key={id} className={cn(CARD_CLASS, "flex flex-col gap-3.5")}>
                        <div
                            className={cn(
                                "aspect-4/5 animate-pulse rounded-field",
                                HATCHED_PLACEHOLDER_CLASS,
                            )}
                        />
                        <div className="h-5 w-4/5 rounded-xs bg-line-subtle" />
                        <div className="h-4 w-1/2 rounded-xs bg-line-subtle" />
                    </div>
                ))}
            </div>
            <ViewAllButton />
        </SectionShell>
    );
}

function LatestAcquisitionsRail({ products }: { readonly products: readonly ProductListing[] }) {
    const { t } = useTranslation();
    const trackId = useId();
    const trackRef = useRef<HTMLDivElement>(null);
    const [rail, setRail] = useState<RailState>(INITIAL_RAIL);
    const total = products.length;

    const update = useCallback(() => {
        if (trackRef.current) {
            setRail(measureRail(trackRef.current, total));
        }
    }, [total]);

    useEffect(() => {
        update();
        window.addEventListener("resize", update, { passive: true });
        return () => window.removeEventListener("resize", update);
    }, [update]);

    const page = (direction: -1 | 1) => {
        const track = trackRef.current;
        if (!track) return;
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        track.scrollBy({
            left: direction * track.clientWidth,
            behavior: reduceMotion ? "auto" : "smooth",
        });
    };

    return (
        <SectionShell>
            <RailHeader trackId={trackId} rail={rail} onPage={page} />

            <div
                id={trackId}
                ref={trackRef}
                role="region"
                aria-label={t("landingPage.latest.region", { count: total })}
                // biome-ignore lint/a11y/noNoninteractiveTabindex: the scrollable rail must be reachable by keyboard.
                tabIndex={0}
                onScroll={update}
                className={cn(
                    "-mx-(--page-gutter) flex snap-x snap-mandatory scroll-px-(--page-gutter) gap-3 overflow-x-auto px-(--page-gutter) pt-0.5 pb-1.5 [scrollbar-width:none] md:mx-0 md:scroll-px-0 md:gap-5 md:px-0 [&::-webkit-scrollbar]:hidden",
                    NAV_FOCUS_CLASS,
                )}
            >
                {products.map((product) => (
                    <ObjectCard
                        key={product.productListingId}
                        product={product}
                        className={CARD_CLASS}
                    />
                ))}
            </div>

            <div className="hidden items-center gap-5 md:flex">
                <div
                    aria-hidden="true"
                    className="relative h-0.5 flex-1 overflow-hidden rounded-xs bg-line"
                >
                    <div
                        data-theme="dark"
                        className="absolute inset-y-0 rounded-xs bg-surface transition-[left] duration-250 ease-out motion-reduce:transition-none"
                        style={{ left: `${rail.progressLeft}%`, width: `${rail.progressWidth}%` }}
                    />
                </div>
                <span className="font-mono text-[11px] tracking-[0.12em] whitespace-nowrap text-ink-secondary">
                    {t("landingPage.latest.counter", {
                        range: `${pad(rail.first)}–${pad(rail.last)}`,
                        total: pad(total),
                    })}
                </span>
            </div>

            <ViewAllButton />
        </SectionShell>
    );
}

function LatestAcquisitionsContent() {
    const { data: products = [], isPending } = useRecentlyAddedProducts();

    if (isPending) return <LatestAcquisitionsSkeleton />;
    if (products.length === 0) return null;

    return <LatestAcquisitionsRail products={products.slice(0, RECENTLY_ADDED_COUNT)} />;
}

/**
 * "Latest acquisitions": the newest listings in a paging rail. Loaded after mount only, so the
 * prerendered landing page never carries inventory (see landing-page prerendering guidelines).
 */
export function LatestAcquisitionsSection() {
    return (
        <ClientOnly fallback={<LatestAcquisitionsSkeleton />}>
            <LatestAcquisitionsContent />
        </ClientOnly>
    );
}
