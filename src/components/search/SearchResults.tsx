import { ProductCard } from "@/components/product/overview/ProductCard.tsx";
import { ProductCardSkeleton } from "@/components/product/overview/ProductCardSkeleton.tsx";
import { SectionInfoText } from "@/components/typography/SectionInfoText.tsx";
import { useEffect } from "react";
import { SearchX } from "lucide-react";
import type { SearchResultData } from "@/data/internal/search/SearchResultData.ts";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import { useSearch } from "@/hooks/search/useSearch.ts";
import { useTranslation } from "react-i18next";
import { H3 } from "@/components/typography/H3.tsx";
import { ListLoaderRow } from "@/components/common/ListLoaderRow.tsx";
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
        return <SectionInfoText>{t("search.messages.error")}</SectionInfoText>;
    }

    if (allProducts.length === 0) {
        return (
            <div className="flex flex-col items-center gap-4 py-16">
                <SearchX className="h-16 w-16 text-muted-foreground" />
                <div className="text-center space-y-2">
                    <H3>{t("search.messages.noResults.title")}</H3>
                    <p className="text-base text-muted-foreground">
                        {t("search.messages.noResults.description")}
                    </p>
                </div>
            </div>
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
