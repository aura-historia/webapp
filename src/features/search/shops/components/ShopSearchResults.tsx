import { Link } from "@tanstack/react-router";
import { SearchX, TriangleAlert } from "lucide-react";
import { useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import { ListLoaderRow } from "@/components/common/ListLoaderRow.tsx";
import type { ShopSearchFilterArguments } from "@/data/internal/search/ShopSearchFilterArguments.ts";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { RESULT_GRID_CLASS } from "@/features/search/products/components/SearchResults.tsx";
import {
    RESULT_SECONDARY_BUTTON_CLASS,
    ResultStatePanel,
} from "@/features/search/products/components/results/SearchResultPlaceholders.tsx";
import { useShopSearch } from "@/features/search/shops/api/useShopSearch.ts";
import {
    ShopResultCard,
    ShopResultCardSkeleton,
} from "@/features/search/shops/components/ShopResultCard.tsx";

const SKELETON_IDS = ["s1", "s2", "s3", "s4", "s5", "s6"] as const;

const PRIMARY_BUTTON_CLASS =
    "inline-flex h-11 items-center justify-center rounded-pill bg-ink px-5 text-sm font-medium text-surface outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass";

const TEXT_BUTTON_CLASS =
    "inline-flex min-h-11 cursor-pointer items-center text-sm font-medium text-ink underline decoration-line-strong underline-offset-3 hover:text-brass-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass";

type ShopSearchResultsProps = {
    readonly searchFilters: ShopSearchFilterArguments;
};

/**
 * The Providers tab results: the same grid, states and list foot as the object results. The
 * provider search API returns no total, so the foot never shows a count.
 */
export function ShopSearchResults({ searchFilters }: ShopSearchResultsProps) {
    const { ref: sentinelRef, inView } = useInView();
    const { t } = useTranslation();
    const query = searchFilters.q.trim();
    const { data, isPending, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
        useShopSearch(searchFilters);

    const allSources = data?.pages.flatMap((page) => page.sources) ?? [];
    const allLoaded = allSources.length > 0 && !hasNextPage;

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage && !error) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, error, fetchNextPage]);

    if (isPending) {
        return (
            <output className={RESULT_GRID_CLASS} aria-busy="true">
                <span className="sr-only">{t("search.providers.loading")}</span>
                {SKELETON_IDS.map((id) => (
                    <ShopResultCardSkeleton key={id} />
                ))}
            </output>
        );
    }

    if (error && allSources.length === 0) {
        return (
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
                        i18nKey="search.messages.error.headline"
                        components={HEADLINE_COMPONENTS}
                    />
                }
                description={t("search.messages.error.description")}
            >
                <button
                    type="button"
                    onClick={() => refetch()}
                    className={RESULT_SECONDARY_BUTTON_CLASS}
                >
                    {t("search.messages.error.retry")}
                </button>
            </ResultStatePanel>
        );
    }

    if (allSources.length === 0 && hasNextPage) {
        return <div ref={sentinelRef} aria-hidden className="h-px w-full" />;
    }

    if (allSources.length === 0) {
        return (
            <ResultStatePanel
                icon={
                    <span
                        aria-hidden="true"
                        className="inline-flex size-14 items-center justify-center rounded-pill bg-surface-raised text-ink-muted shadow-ring"
                    >
                        <SearchX className="size-[22px]" strokeWidth={1.7} />
                    </span>
                }
                title={
                    <Trans
                        i18nKey="search.providers.noResults.headline"
                        components={HEADLINE_COMPONENTS}
                    />
                }
                description={
                    query
                        ? t("search.providers.noResults.description", { query })
                        : t("search.providers.noResults.descriptionAll")
                }
            >
                {query && (
                    <>
                        <Link
                            to="/$lng/search"
                            params={true}
                            from="/$lng"
                            search={{ q: query }}
                            className={PRIMARY_BUTTON_CLASS}
                        >
                            {t("search.providers.searchObjectsFor", { query })}
                        </Link>
                        <Link
                            to="/$lng/search/shops"
                            params={true}
                            from="/$lng"
                            search={{ q: "" }}
                            className={RESULT_SECONDARY_BUTTON_CLASS}
                        >
                            {t("search.providers.showAll")}
                        </Link>
                    </>
                )}
            </ResultStatePanel>
        );
    }

    return (
        <div>
            <div className={RESULT_GRID_CLASS}>
                {allSources.map((source) => (
                    <ShopResultCard key={source.listingSourceId} shop={source} />
                ))}
            </div>

            {error ? (
                <div
                    role="alert"
                    className="mt-14 flex flex-wrap items-center justify-center gap-x-3 border-t border-line-subtle py-6 text-center text-body-sm text-ink-secondary"
                >
                    {t("search.providers.loadMoreError")}
                    <button
                        type="button"
                        onClick={() => fetchNextPage()}
                        className={TEXT_BUTTON_CLASS}
                    >
                        {t("search.messages.error.retry")}
                    </button>
                </div>
            ) : (
                (isFetchingNextPage || allLoaded) && (
                    <ListLoaderRow
                        isFetchingNextPage={isFetchingNextPage}
                        loadingMoreKey="search.providers.loadingMore"
                        allLoadedFallbackKey={
                            query
                                ? "search.providers.allLoadedForQuery"
                                : "search.providers.allLoaded"
                        }
                        allLoadedValues={query ? { query } : undefined}
                    />
                )
            )}

            {hasNextPage && !error && <div ref={sentinelRef} aria-hidden className="h-px w-full" />}
        </div>
    );
}
