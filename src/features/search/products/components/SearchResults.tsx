import { Info, SearchX, TriangleAlert } from "lucide-react";
import { useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import { ListLoaderRow } from "@/components/common/ListLoaderRow.tsx";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import type { SearchResultData } from "@/data/internal/search/SearchResultData.ts";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { SaveSearchButton } from "@/features/saved-searches/components/SaveSearchButton.tsx";
import { SearchResultCard } from "@/features/search/products/components/results/SearchResultCard.tsx";
import {
    RESULT_SECONDARY_BUTTON_CLASS,
    ResultStatePanel,
    SearchHiddenMatchCard,
    SearchResultCardSkeleton,
} from "@/features/search/products/components/results/SearchResultPlaceholders.tsx";
import { useSearch } from "@/features/search/products/hooks/useSearch.ts";
import { MIN_SEARCH_QUERY_LENGTH } from "@/features/search/products/lib/filterDefaults.ts";

type SearchResultsProps = {
    readonly searchFilters: SearchFilterArguments;
    readonly onTotalChange?: (total?: number) => void;
    readonly onResetFilters: () => void;
};

const SKELETON_IDS = ["s1", "s2", "s3", "s4", "s5", "s6"] as const;

/** Two columns on phones and tablets, three once the results column is wide enough. */
export const RESULT_GRID_CLASS =
    "grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-6 sm:gap-y-10 min-[1180px]:grid-cols-3";

export function SearchResults({
    searchFilters,
    onTotalChange,
    onResetFilters,
}: SearchResultsProps) {
    const { ref: sentinelRef, inView } = useInView();
    const { t, i18n } = useTranslation();
    const { data, isPending, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
        useSearch(searchFilters);
    const isQueryTooShort = searchFilters.q.length < MIN_SEARCH_QUERY_LENGTH;

    const allProducts = data?.pages.flatMap((page: SearchResultData) => page.products) ?? [];
    const totalProducts = data?.pages[0]?.total;
    const allLoaded = allProducts.length > 0 && !hasNextPage;

    useEffect(() => {
        onTotalChange?.(isQueryTooShort ? undefined : totalProducts);
    }, [totalProducts, onTotalChange, isQueryTooShort]);

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage && !isQueryTooShort) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage, isQueryTooShort]);

    if (isQueryTooShort) {
        return (
            <div
                role="status"
                className="flex items-start gap-3 rounded-lg bg-surface-raised px-[18px] py-4 text-body text-ink-secondary shadow-field"
            >
                <Info
                    aria-hidden="true"
                    className="mt-[3px] size-[18px] shrink-0 text-ink-muted"
                    strokeWidth={1.8}
                />
                {t("search.messages.minQueryLength")}
            </div>
        );
    }

    if (isPending) {
        return (
            <div className={RESULT_GRID_CLASS} role="status" aria-busy="true">
                <span className="sr-only">{t("search.messages.loading")}</span>
                {SKELETON_IDS.map((id) => (
                    <SearchResultCardSkeleton key={id} />
                ))}
            </div>
        );
    }

    if (error) {
        console.error(error);
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

    if (allProducts.length === 0 && hasNextPage) {
        return <div ref={sentinelRef} aria-hidden className="h-px w-full" />;
    }

    if (allProducts.length === 0) {
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
                        i18nKey="search.messages.noResults.headline"
                        components={HEADLINE_COMPONENTS}
                    />
                }
                description={`${t("search.messages.noResults.description")} ${t("search.messages.noResults.saveHint")}`}
            >
                <button
                    type="button"
                    onClick={onResetFilters}
                    className={RESULT_SECONDARY_BUTTON_CLASS}
                >
                    {t("search.resetAllFilters")}
                </button>
                <SaveSearchButton searchArgs={searchFilters} size="md" />
            </ResultStatePanel>
        );
    }

    return (
        <div>
            <div className={RESULT_GRID_CLASS}>
                {allProducts.map((product) =>
                    product.userState?.searchFilter?.hidden === true ? (
                        <SearchHiddenMatchCard key={product.productListingId} />
                    ) : (
                        <SearchResultCard key={product.productListingId} product={product} />
                    ),
                )}
            </div>

            {(isFetchingNextPage || allLoaded) && (
                <ListLoaderRow
                    isFetchingNextPage={isFetchingNextPage}
                    totalCount={totalProducts}
                    progress={
                        totalProducts == null
                            ? undefined
                            : t("search.messages.loadedOf", {
                                  loaded: allProducts.length.toLocaleString(i18n.language),
                                  total: totalProducts.toLocaleString(i18n.language),
                              })
                    }
                />
            )}

            {hasNextPage && <div ref={sentinelRef} aria-hidden className="h-px w-full" />}
        </div>
    );
}
