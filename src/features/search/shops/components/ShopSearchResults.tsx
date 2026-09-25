import { ShopCard } from "@/features/shop/profile/components/ShopCard.tsx";
import { ShopCardSkeleton } from "@/features/shop/profile/components/ShopCardSkeleton.tsx";
import { useEffect } from "react";
import { SearchX, ServerCrash } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState.tsx";
import type { ShopSearchFilterArguments } from "@/data/internal/search/ShopSearchFilterArguments.ts";
import { useShopSearch } from "@/features/search/shops/api/useShopSearch.ts";
import { useTranslation } from "react-i18next";
import { ListLoaderRow } from "@/components/common/ListLoaderRow.tsx";
import { useInView } from "react-intersection-observer";

type ShopSearchResultsProps = {
    readonly searchFilters: ShopSearchFilterArguments;
};

const SKELETON_IDS = [
    "shop-skeleton-1",
    "shop-skeleton-2",
    "shop-skeleton-3",
    "shop-skeleton-4",
] as const;

export function ShopSearchResults({ searchFilters }: ShopSearchResultsProps) {
    const { ref: sentinelRef, inView } = useInView();
    const { t } = useTranslation();
    const { data, isPending, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useShopSearch(searchFilters);

    const allSources = data?.pages.flatMap((page) => page.sources) ?? [];

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

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
        return (
            <EmptyState
                icon={ServerCrash}
                title={t("search.messages.error.title")}
                description={t("search.messages.error.description")}
            />
        );
    }

    if (allSources.length === 0 && hasNextPage) {
        return <div ref={sentinelRef} aria-hidden className="h-px w-full" />;
    }

    if (allSources.length === 0) {
        return (
            <EmptyState
                icon={SearchX}
                title={t("search.messages.noResults.title")}
                description={t("search.messages.noResults.description")}
            />
        );
    }

    const showLoaderRow = isFetchingNextPage || !hasNextPage;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {allSources.map((source) => (
                    <ShopCard key={source.listingSourceId} shop={source} />
                ))}
            </div>

            {showLoaderRow && (
                <div>
                    <ListLoaderRow isFetchingNextPage={isFetchingNextPage} />
                </div>
            )}

            {hasNextPage && <div ref={sentinelRef} aria-hidden className="h-px w-full" />}
        </div>
    );
}
