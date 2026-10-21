import { Pencil, Search, TriangleAlert } from "lucide-react";
import { type ReactNode, useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import { ListLoaderRow } from "@/components/common/ListLoaderRow.tsx";
import type { ProductListing } from "@/data/internal/product/ProductListing.ts";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { useSearchFilterMatchedProducts } from "@/features/saved-searches/api/useSearchFilterMatchedProducts.ts";
import { SearchFilterMatchCard } from "@/features/saved-searches/components/match/SearchFilterMatchCard.tsx";
import {
    MONO_LABEL_CLASS,
    SECONDARY_PILL_CLASS,
    SECTION_HEADING_CLASS,
} from "@/features/saved-searches/lib/searchFilterStyles.ts";
import {
    RESULT_SECONDARY_BUTTON_CLASS,
    ResultStatePanel,
    SearchHiddenMatchCard,
    SearchResultCardSkeleton,
} from "@/features/search/products/components/results/SearchResultPlaceholders.tsx";
import { cn } from "@/lib/utils.ts";

type Props = {
    readonly filterId: string;
    /** Opens the edit wizard from the empty state. */
    readonly onEdit?: () => void;
};

const SKELETON_IDS = ["skeleton-1", "skeleton-2", "skeleton-3", "skeleton-4"] as const;

/** Two columns on phones, three from tablets, four once the page is wide enough. */
const MATCH_GRID_CLASS =
    "grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-6 sm:gap-y-10 md:grid-cols-3 min-[1180px]:grid-cols-4";

export function SearchFilterMatches({ filterId, onEdit }: Props) {
    const { ref, inView } = useInView();
    const { t } = useTranslation();
    const { data, isPending, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
        useSearchFilterMatchedProducts(filterId);

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const allProducts: ProductListing[] = data?.pages.flatMap((page) => [...page.items]) ?? [];
    const totalProducts = data?.pages[0]?.total ?? allProducts.length;
    const allLoaded = !hasNextPage && allProducts.length > 0;
    const showLoaderRow = isFetchingNextPage || allLoaded;

    let content: ReactNode;
    if (isPending) {
        content = (
            <div className={MATCH_GRID_CLASS} role="status" aria-busy="true">
                <span className="sr-only">{t("searchFilters.matchesLoading")}</span>
                {SKELETON_IDS.map((id) => (
                    <SearchResultCardSkeleton key={id} />
                ))}
            </div>
        );
    } else if (error) {
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
                        i18nKey="searchFilters.matchesError.headline"
                        components={HEADLINE_COMPONENTS}
                    />
                }
                description={t("searchFilters.matchesError.description")}
            >
                <button
                    type="button"
                    onClick={() => refetch()}
                    className={RESULT_SECONDARY_BUTTON_CLASS}
                >
                    {t("searchFilters.loadingError.retry")}
                </button>
            </ResultStatePanel>
        );
    } else if (allProducts.length === 0 && hasNextPage) {
        content = <div ref={ref} aria-hidden className="h-px w-full" />;
    } else if (allProducts.length === 0) {
        content = (
            <ResultStatePanel
                icon={
                    <span
                        aria-hidden="true"
                        className="inline-flex size-14 items-center justify-center rounded-pill bg-surface-raised text-ink-muted shadow-ring"
                    >
                        <Search className="size-[22px]" strokeWidth={1.7} />
                    </span>
                }
                title={
                    <Trans
                        i18nKey="searchFilters.noMatches.headline"
                        components={HEADLINE_COMPONENTS}
                    />
                }
                description={t("searchFilters.noMatches.description")}
            >
                {onEdit && (
                    <button
                        type="button"
                        onClick={onEdit}
                        className={cn(SECONDARY_PILL_CLASS, "pr-5")}
                    >
                        <Pencil aria-hidden="true" className="size-4" strokeWidth={1.7} />
                        {t("searchFilters.noMatches.editCta")}
                    </button>
                )}
            </ResultStatePanel>
        );
    } else {
        content = (
            <>
                <div className={MATCH_GRID_CLASS}>
                    {allProducts.map((product, index) => {
                        const isHidden = product.userState?.searchFilter.hidden === true;
                        const key = isHidden ? `hidden-${index}` : product.productListingId;
                        return isHidden ? (
                            <SearchHiddenMatchCard key={key} />
                        ) : (
                            <SearchFilterMatchCard
                                key={key}
                                product={product}
                                filterId={filterId}
                            />
                        );
                    })}
                </div>
                {showLoaderRow && (
                    <ListLoaderRow
                        isFetchingNextPage={isFetchingNextPage}
                        totalCount={totalProducts}
                        loadingMoreKey="searchFilters.matchesLoadingMore"
                        allLoadedKey="searchFilters.matchesAllLoaded"
                        progress={
                            isFetchingNextPage
                                ? t("searchFilters.matchesProgress", {
                                      loaded: allProducts.length,
                                      total: totalProducts,
                                  })
                                : undefined
                        }
                    />
                )}
                {hasNextPage && <div ref={ref} aria-hidden className="h-px w-full" />}
            </>
        );
    }

    return (
        <section aria-labelledby="search-filter-matches" className="flex w-full flex-col">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 sm:mb-9">
                <div className="flex max-w-[620px] flex-col gap-3">
                    <h2
                        id="search-filter-matches"
                        className={cn(SECTION_HEADING_CLASS, "text-[26px] sm:text-[30px]")}
                    >
                        <Trans
                            i18nKey="searchFilters.matchesHeading"
                            components={HEADLINE_COMPONENTS}
                        />
                    </h2>
                    <p className="text-body-sm text-ink-secondary">
                        {t("searchFilters.matchesHint")}
                    </p>
                </div>
                {!isPending && !error && (
                    <span className={cn(MONO_LABEL_CLASS, "text-ink")}>
                        {t("searchFilters.matchesCount", { count: totalProducts })}
                    </span>
                )}
            </div>
            {content}
        </section>
    );
}
