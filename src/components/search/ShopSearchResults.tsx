import { ShopCard } from "@/components/shop/ShopCard.tsx";
import { ShopCardSkeleton } from "@/components/shop/ShopCardSkeleton.tsx";
import { SectionInfoText } from "@/components/typography/SectionInfoText.tsx";
import { useEffect } from "react";
import { SearchX } from "lucide-react";
import type { ShopSearchFilterArguments } from "@/data/internal/search/ShopSearchFilterArguments.ts";
import { useShopSearch } from "@/hooks/search/useShopSearch.ts";
import { useTranslation } from "react-i18next";
import { H3 } from "@/components/typography/H3.tsx";
import { ListLoaderRow } from "@/components/common/ListLoaderRow.tsx";
import { useInView } from "react-intersection-observer";
import { MIN_SEARCH_QUERY_LENGTH } from "@/lib/filterDefaults.ts";

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
        return <SectionInfoText>{t("search.messages.error")}</SectionInfoText>;
    }

    if (allShops.length === 0) {
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
