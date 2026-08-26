import { ProductCard } from "@/features/product/catalog/components/cards/ProductCard.tsx";
import { HiddenMatchCard } from "@/features/product/catalog/components/cards/HiddenMatchCard.tsx";
import { ProductCardSkeleton } from "@/features/product/catalog/components/cards/ProductCardSkeleton.tsx";
import { useEffect } from "react";
import { SearchX, ServerCrash } from "lucide-react";
import { SectionInfoText } from "@/components/typography/SectionInfoText.tsx";
import type { SearchResultData } from "@/data/internal/search/SearchResultData.ts";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import { useSearch } from "@/features/search/products/hooks/useSearch.ts";
import { useTranslation } from "react-i18next";
import { ListLoaderRow } from "@/components/common/ListLoaderRow.tsx";
import { EmptyState } from "@/components/common/EmptyState.tsx";
import { useInView } from "react-intersection-observer";
import { MIN_SEARCH_QUERY_LENGTH } from "@/features/search/products/lib/filterDefaults.ts";

type SearchResultsProps = {
    readonly searchFilters: SearchFilterArguments;
    readonly onTotalChange?: (total?: number) => void;
};

const SKELETON_IDS = ["skeleton-1", "skeleton-2", "skeleton-3", "skeleton-4"] as const;

export function SearchResults({ searchFilters, onTotalChange }: SearchResultsProps) {
    const { ref: sentinelRef, inView } = useInView();
    const { t } = useTranslation();
    const { data, isPending, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useSearch(searchFilters);

    const allProducts = data?.pages.flatMap((page: SearchResultData) => page.products) ?? [];

    const totalProducts = data?.pages[0]?.total;
    const allLoaded = allProducts.length > 0 && !hasNextPage;

    useEffect(() => {
        if (onTotalChange) {
            onTotalChange(totalProducts);
        }
    }, [totalProducts, onTotalChange]);

    useEffect(() => {
        if (
            inView &&
            hasNextPage &&
            !isFetchingNextPage &&
            searchFilters.q.length >= MIN_SEARCH_QUERY_LENGTH
        ) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage, searchFilters.q.length]);

    if (searchFilters.q.length < MIN_SEARCH_QUERY_LENGTH) {
        return <SectionInfoText>{t("search.messages.minQueryLength")}</SectionInfoText>;
    }

    if (isPending) {
        return (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {SKELETON_IDS.map((id) => (
                    <ProductCardSkeleton key={id} />
                ))}
            </div>
        );
    }

    if (error) {
        console.error(error);
        return (
            <EmptyState
                icon={ServerCrash}
                title={t("search.messages.error.title")}
                description={t("search.messages.error.description")}
            />
        );
    }

    if (allProducts.length === 0) {
        return (
            <EmptyState
                icon={SearchX}
                title={t("search.messages.noResults.title")}
                description={t("search.messages.noResults.description")}
            />
        );
    }

    const showLoaderRow = isFetchingNextPage || allLoaded;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {allProducts.map((product) => {
                    const isHidden = product.userData?.searchFilterData?.hidden === true;
                    return isHidden ? (
                        <HiddenMatchCard key={product.productId} />
                    ) : (
                        <ProductCard key={product.productId} product={product} />
                    );
                })}
            </div>

            {showLoaderRow && (
                <div>
                    <ListLoaderRow
                        isFetchingNextPage={isFetchingNextPage}
                        totalCount={totalProducts}
                    />
                </div>
            )}

            {hasNextPage && <div ref={sentinelRef} aria-hidden className="h-px w-full" />}
        </div>
    );
}
