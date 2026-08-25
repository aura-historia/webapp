import { ProductCard } from "@/features/product/catalog/components/cards/ProductCard.tsx";
import { ProductCardSkeleton } from "@/features/product/catalog/components/cards/ProductCardSkeleton.tsx";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { H1 } from "@/components/typography/H1.tsx";
import { useTranslation } from "react-i18next";
import type { OverviewProduct } from "@/data/internal/product/OverviewProduct.ts";
import { SearchX, ServerCrash } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState.tsx";
import { useWatchlist } from "@/hooks/watchlist/useWatchlist.ts";
import { ListLoaderRow } from "@/components/common/ListLoaderRow.tsx";

const SKELETON_IDS = ["skeleton-1", "skeleton-2", "skeleton-3", "skeleton-4"] as const;

export function WatchlistResults() {
    const { ref, inView } = useInView();
    const { t } = useTranslation();
    const { data, isPending, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useWatchlist();

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

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
                title={t("watchlist.loadingError.title")}
                description={t("watchlist.loadingError.description")}
            />
        );
    }

    const allProducts: OverviewProduct[] =
        data?.pages.flatMap((page) =>
            page.products.map((product) => {
                return {
                    ...product,
                    userData: {
                        watchlistData: {
                            isWatching: true,
                            isNotificationEnabled:
                                product.userData?.watchlistData.isNotificationEnabled ?? false,
                        },
                        notificationData: {
                            hasUnseenNotification:
                                product.userData?.notificationData?.hasUnseenNotification ?? false,
                            originEventId: product.userData?.notificationData?.originEventId,
                        },
                        restrictedContentData: {
                            consentGiven:
                                product.userData?.restrictedContentData.consentGiven ?? false,
                        },
                    },
                };
            }),
        ) ?? [];

    const totalProducts = data?.pages[0]?.total ?? 0;
    const allLoaded = allProducts.length > 0 && !hasNextPage;
    const showLoaderRow = isFetchingNextPage || allLoaded;

    if (allProducts.length === 0) {
        return (
            <EmptyState
                icon={SearchX}
                title={t("watchlist.noResults.title")}
                description={t("watchlist.noResults.description")}
            />
        );
    }

    return (
        <div className={"flex flex-col w-full gap-8"}>
            <div className="flex flex-row items-center justify-between">
                <H1>{t("watchlist.title")}</H1>
                <span className={"text-2xl font-semibold whitespace-nowrap"}>
                    {t("watchlist.totalElements", {
                        count: totalProducts,
                    })}
                </span>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {allProducts.map((watchlistProduct: OverviewProduct) => (
                    <ProductCard key={watchlistProduct.productId} product={watchlistProduct} />
                ))}
            </div>
            {showLoaderRow && (
                <div ref={ref}>
                    <ListLoaderRow
                        isFetchingNextPage={isFetchingNextPage}
                        totalCount={totalProducts}
                        loadingMoreKey="watchlist.loadingMore"
                        allLoadedKey="watchlist.allLoaded"
                    />
                </div>
            )}
        </div>
    );
}
