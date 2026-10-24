import { Link } from "@tanstack/react-router";
import { Bookmark, Search, TriangleAlert } from "lucide-react";
import { type ReactNode, useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import { ListLoaderRow } from "@/components/common/ListLoaderRow.tsx";
import type { ProductListing } from "@/data/internal/product/ProductListing.ts";
import { env } from "@/env.ts";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { SearchResultCard } from "@/features/search/products/components/results/SearchResultCard.tsx";
import {
    RESULT_SECONDARY_BUTTON_CLASS,
    ResultStatePanel,
    SearchResultCardSkeleton,
} from "@/features/search/products/components/results/SearchResultPlaceholders.tsx";
import { useWatchlist } from "@/features/watchlist/api/useWatchlist.ts";

const SKELETON_IDS = ["skeleton-1", "skeleton-2", "skeleton-3", "skeleton-4"] as const;

/** Two columns on phones, three from tablets, four once the page is wide enough. */
const WATCHLIST_GRID_CLASS =
    "grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-6 sm:gap-y-10 md:grid-cols-3 min-[1180px]:grid-cols-4";

const PRIMARY_BUTTON_CLASS =
    "inline-flex h-11 items-center justify-center gap-2 rounded-pill bg-ink px-5 text-sm font-medium text-surface outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass";

const isSearchEnabled = env.VITE_FEATURE_SEARCH_ENABLED;

export function WatchlistPage() {
    const { ref: sentinelRef, inView } = useInView();
    const { t } = useTranslation();
    const { data, isPending, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
        useWatchlist();

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const allProducts: ProductListing[] = data?.pages.flatMap((page) => page.products) ?? [];
    const allLoaded = allProducts.length > 0 && !hasNextPage;

    let content: ReactNode;
    if (isPending) {
        content = (
            <div className={WATCHLIST_GRID_CLASS} role="status" aria-busy="true">
                <span className="sr-only">{t("watchlist.loading")}</span>
                {SKELETON_IDS.map((id) => (
                    <SearchResultCardSkeleton key={id} />
                ))}
            </div>
        );
    } else if (error) {
        console.error(error);
        content = (
            <ResultStatePanel
                alert
                icon={
                    <span
                        aria-hidden="true"
                        className="inline-flex size-14 items-center justify-center rounded-pill bg-oxblood text-on-oxblood"
                    >
                        <TriangleAlert className="size-[22px]" strokeWidth={1.8} />
                    </span>
                }
                title={
                    <Trans
                        i18nKey="watchlist.loadingError.headline"
                        components={HEADLINE_COMPONENTS}
                    />
                }
                description={t("watchlist.loadingError.description")}
            >
                <button
                    type="button"
                    onClick={() => refetch()}
                    className={RESULT_SECONDARY_BUTTON_CLASS}
                >
                    {t("watchlist.loadingError.retry")}
                </button>
            </ResultStatePanel>
        );
    } else if (allProducts.length === 0) {
        content = (
            <ResultStatePanel
                icon={
                    <span
                        aria-hidden="true"
                        className="inline-flex size-14 items-center justify-center rounded-pill bg-surface-raised text-ink-muted shadow-ring"
                    >
                        <Bookmark className="size-[22px]" strokeWidth={1.7} />
                    </span>
                }
                title={
                    <Trans
                        i18nKey="watchlist.noResults.headline"
                        components={HEADLINE_COMPONENTS}
                    />
                }
                description={t("watchlist.noResults.description")}
            >
                {isSearchEnabled && (
                    <Link
                        to="/$lng/search"
                        params={true}
                        from="/$lng"
                        className={PRIMARY_BUTTON_CLASS}
                    >
                        <Search aria-hidden="true" className="size-[15px]" strokeWidth={1.8} />
                        {t("watchlist.noResults.cta")}
                    </Link>
                )}
            </ResultStatePanel>
        );
    } else {
        content = (
            <>
                <div className={WATCHLIST_GRID_CLASS}>
                    {allProducts.map((product) => (
                        <SearchResultCard key={product.productListingId} product={product} />
                    ))}
                </div>

                {(isFetchingNextPage || allLoaded) && (
                    <ListLoaderRow
                        isFetchingNextPage={isFetchingNextPage}
                        totalCount={allProducts.length}
                        loadingMoreKey="watchlist.loadingMore"
                        allLoadedKey="watchlist.allLoaded"
                    />
                )}

                {hasNextPage && <div ref={sentinelRef} aria-hidden className="h-px w-full" />}
            </>
        );
    }

    return (
        <div className="mx-auto w-full max-w-[calc(var(--container-content)+2*var(--page-gutter))] px-(--page-gutter) pt-8 pb-24 sm:pt-14 sm:pb-36">
            <header className="mb-6 flex flex-col gap-3 border-b border-line-subtle pb-6 sm:mb-9 sm:gap-4 sm:pb-9">
                <h1 className="font-serif text-[40px] leading-[1.04] font-normal tracking-[-0.02em] sm:text-[clamp(40px,4.6vw,68px)] sm:leading-[1.02] [&_em]:italic">
                    <Trans i18nKey="watchlist.heading" components={HEADLINE_COMPONENTS} />
                </h1>
                <p className="max-w-[720px] text-body text-ink-secondary">{t("watchlist.lead")}</p>
            </header>
            {content}
        </div>
    );
}
