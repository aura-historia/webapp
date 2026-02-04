import { ProductCard } from "@/components/product/overview/ProductCard.tsx";
import { ProductCardSkeleton } from "@/components/product/overview/ProductCardSkeleton.tsx";
import { SectionInfoText } from "@/components/typography/SectionInfoText.tsx";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { SearchX } from "lucide-react";
import type { SearchResultData } from "@/data/internal/search/SearchResultData.ts";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import { useSearch } from "@/hooks/search/useSearch.ts";
import { useTranslation } from "react-i18next";
import { H3 } from "@/components/typography/H3.tsx";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { ListLoaderRow } from "@/components/common/ListLoaderRow.tsx";

type SearchResultsProps = {
    readonly searchFilters: SearchFilterArguments;
    readonly onTotalChange?: (total: number) => void;
};

const SKELETON_IDS = ["skeleton-1", "skeleton-2", "skeleton-3", "skeleton-4"] as const;
const ESTIMATED_PRODUCT_CARD_HEIGHT = 280;
const ESTIMATED_LOADER_ROW_HEIGHT = 100;
const VIRTUALIZER_OVERSCAN = 5;

export function SearchResults({ searchFilters, onTotalChange }: SearchResultsProps) {
    const listRef = useRef<HTMLDivElement>(null);
    const [scrollMargin, setScrollMargin] = useState(0);
    const { t } = useTranslation();
    const { data, isPending, error, fetchNextPage, isFetchingNextPage } = useSearch(searchFilters);

    const allProducts = data?.pages.flatMap((page: SearchResultData) => page.products) ?? [];

    const totalProducts = data?.pages[0]?.total ?? 0;
    const allLoaded = allProducts.length >= totalProducts && totalProducts > 0;
    const showLoaderRow = isFetchingNextPage || allLoaded;
    const itemCount = allProducts.length > 0 ? allProducts.length + (showLoaderRow ? 1 : 0) : 0;

    const virtualizer = useWindowVirtualizer({
        count: itemCount,
        estimateSize: (index) =>
            index >= allProducts.length
                ? ESTIMATED_LOADER_ROW_HEIGHT
                : ESTIMATED_PRODUCT_CARD_HEIGHT,
        overscan: VIRTUALIZER_OVERSCAN,
        scrollMargin,
    });

    const virtualItems = virtualizer.getVirtualItems();

    useLayoutEffect(() => {
        if (listRef.current) {
            setScrollMargin(listRef.current.offsetTop);
        }
    }, []);

    useEffect(() => {
        if (totalProducts > 0 && onTotalChange) {
            onTotalChange(totalProducts);
        }
    }, [totalProducts, onTotalChange]);

    useEffect(() => {
        const lastItem = virtualItems[virtualItems.length - 1];
        if (!lastItem) return;

        const shouldFetch =
            lastItem.index >= allProducts.length - 1 &&
            !allLoaded &&
            !isFetchingNextPage &&
            searchFilters.q.length >= 3;

        if (shouldFetch) {
            fetchNextPage();
        }
    }, [
        virtualItems,
        allLoaded,
        isFetchingNextPage,
        fetchNextPage,
        allProducts.length,
        searchFilters.q.length,
    ]);

    if (searchFilters.q.length < 3) {
        return <SectionInfoText>{t("search.messages.minQueryLength")}</SectionInfoText>;
    }

    if (isPending) {
        return (
            <div className="flex flex-col gap-4">
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

    return (
        <div ref={listRef}>
            <div
                className="w-full relative"
                style={{
                    height: `${virtualizer.getTotalSize()}px`,
                }}
            >
                {virtualItems.map((virtualItem) => {
                    const isLoaderRow = virtualItem.index >= allProducts.length;
                    const product = allProducts[virtualItem.index];

                    return (
                        <div
                            key={virtualItem.key}
                            data-index={virtualItem.index}
                            ref={virtualizer.measureElement}
                            className="absolute top-0 left-0 w-full pb-4"
                            style={{
                                transform: `translateY(${virtualItem.start - scrollMargin}px)`,
                            }}
                        >
                            {isLoaderRow ? (
                                <ListLoaderRow
                                    isFetchingNextPage={isFetchingNextPage}
                                    totalCount={totalProducts}
                                />
                            ) : (
                                <ProductCard product={product} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
