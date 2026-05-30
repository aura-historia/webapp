import { ProductCard } from "@/components/product/overview/ProductCard.tsx";
import { ProductCardSkeleton } from "@/components/product/overview/ProductCardSkeleton.tsx";
import { useEffect } from "react";
import { SearchX, ServerCrash } from "lucide-react";
import { SectionInfoText } from "@/components/typography/SectionInfoText.tsx";
import type { SearchResultData } from "@/data/internal/search/SearchResultData.ts";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import { useSearch } from "@/hooks/search/useSearch.ts";
import { useTranslation } from "react-i18next";
import { ListLoaderRow } from "@/components/common/ListLoaderRow.tsx";
import { EmptyState } from "@/components/common/EmptyState.tsx";
import { useInView } from "react-intersection-observer";

type SearchResultsProps = {
    readonly searchFilters: SearchFilterArguments;
    readonly onTotalChange?: (total: number) => void;
};

const SKELETON_IDS = ["skeleton-1", "skeleton-2", "skeleton-3", "skeleton-4"] as const;

export function SearchResults({ searchFilters, onTotalChange }: SearchResultsProps) {
    const { ref: sentinelRef, inView } = useInView();
    const { t } = useTranslation();
    const { data, isPending, error, fetchNextPage, isFetchingNextPage } = useSearch(searchFilters);

    const allProducts = data?.pages.flatMap((page: SearchResultData) => page.products) ?? [];

    const totalProducts = data?.pages[0]?.total ?? 0;
    const allLoaded = allProducts.length >= totalProducts && totalProducts > 0;

    useEffect(() => {
        if (onTotalChange) {
            onTotalChange(totalProducts);
        }
    }, [totalProducts, onTotalChange]);

    useEffect(() => {
        if (inView && !allLoaded && !isFetchingNextPage && searchFilters.q.length >= 3) {
            fetchNextPage();
        }
    }, [inView, allLoaded, isFetchingNextPage, fetchNextPage, searchFilters.q.length]);

    if (searchFilters.q.length < 3) {
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
                {allProducts.map((product) => (
                    <ProductCard key={product.productId} product={product} />
                ))}
            </div>

            {showLoaderRow && (
                <div>
                    <ListLoaderRow
                        isFetchingNextPage={isFetchingNextPage}
                        totalCount={totalProducts}
                    />
                </div>
            )}

            {!allLoaded && <div ref={sentinelRef} aria-hidden className="h-px w-full" />}
        </div>
    );
}
