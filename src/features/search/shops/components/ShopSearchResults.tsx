import { ShopCard } from "@/features/shop/profile/components/ShopCard.tsx";
import { ShopCardSkeleton } from "@/features/shop/profile/components/ShopCardSkeleton.tsx";
import { SectionInfoText } from "@/components/typography/SectionInfoText.tsx";
import { useEffect } from "react";
import { SearchX, ServerCrash } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState.tsx";
import type { ShopSearchFilterArguments } from "@/data/internal/search/ShopSearchFilterArguments.ts";
import { useShopSearch } from "@/features/search/shops/api/useShopSearch.ts";
import { useTranslation } from "react-i18next";
import { ListLoaderRow } from "@/components/common/ListLoaderRow.tsx";
import { useInView } from "react-intersection-observer";
import { MIN_SEARCH_QUERY_LENGTH } from "@/features/search/products/lib/filterDefaults.ts";

type ShopSearchResultsProps = {
    readonly searchFilters: ShopSearchFilterArguments;
    readonly onTotalChange?: (total: number) => void;
};

const SKELETON_IDS = [
    "shop-skeleton-1",
    "shop-skeleton-2",
    "shop-skeleton-3",
    "shop-skeleton-4",
] as const;

export function ShopSearchResults({ searchFilters, onTotalChange }: ShopSearchResultsProps) {
    const { ref: sentinelRef, inView } = useInView();
    const { t } = useTranslation();
    const { data, isPending, error, fetchNextPage, isFetchingNextPage } =
        useShopSearch(searchFilters);

    const allShops = data?.pages.flatMap((page) => page.shops) ?? [];

    const totalShops = data?.pages[0]?.total ?? 0;
    const allLoaded = allShops.length >= totalShops && totalShops > 0;

    useEffect(() => {
        if (onTotalChange) {
            onTotalChange(totalShops);
        }
    }, [totalShops, onTotalChange]);

    useEffect(() => {
        if (
            inView &&
            !allLoaded &&
            !isFetchingNextPage &&
            searchFilters.q.length >= MIN_SEARCH_QUERY_LENGTH
        ) {
            fetchNextPage();
        }
    }, [inView, allLoaded, isFetchingNextPage, fetchNextPage, searchFilters.q.length]);

    if (searchFilters.q.length < MIN_SEARCH_QUERY_LENGTH) {
        return <SectionInfoText>{t("search.messages.minQueryLength")}</SectionInfoText>;
    }

    if (isPending) {
        return (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {SKELETON_IDS.map((id) => (
                    <ShopCardSkeleton key={id} />
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

    if (allShops.length === 0) {
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
                {allShops.map((shop) => (
                    <ShopCard key={shop.shopId} shop={shop} />
                ))}
            </div>

            {showLoaderRow && (
                <div>
                    <ListLoaderRow
                        isFetchingNextPage={isFetchingNextPage}
                        totalCount={totalShops}
                    />
                </div>
            )}

            {!allLoaded && <div ref={sentinelRef} aria-hidden className="h-px w-full" />}
        </div>
    );
}
