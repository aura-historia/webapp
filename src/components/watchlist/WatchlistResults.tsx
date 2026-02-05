import { ProductCard } from "@/components/product/overview/ProductCard.tsx";
import { ProductCardSkeleton } from "@/components/product/overview/ProductCardSkeleton.tsx";
import { SectionInfoText } from "@/components/typography/SectionInfoText.tsx";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { H1 } from "@/components/typography/H1.tsx";
import { useTranslation } from "react-i18next";
import type { OverviewProduct } from "@/data/internal/product/OverviewProduct.ts";
import { SearchX } from "lucide-react";
import { H3 } from "@/components/typography/H3.tsx";
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
            <div className="flex flex-col gap-4">
                {SKELETON_IDS.map((id) => (
                    <ProductCardSkeleton key={id} />
                ))}
            </div>
        );
    }

    if (error) {
        console.error(error);
        return <SectionInfoText>{t("watchlist.loadingError")}</SectionInfoText>;
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
                    },
                };
            }),
        ) ?? [];

    const totalProducts = data?.pages[0]?.total ?? 0;
    const allLoaded = allProducts.length >= totalProducts && totalProducts > 0;
    const showLoaderRow = isFetchingNextPage || allLoaded;

    if (allProducts.length === 0) {
        return (
            <div className="flex flex-col items-center gap-4 py-16">
                <SearchX className="h-16 w-16 text-muted-foreground" />
                <div className="text-center space-y-2">
                    <H3>{t("watchlist.noResults.title")}</H3>
                    <p className="text-base text-muted-foreground">
                        {t("watchlist.noResults.description")}
                    </p>
                </div>
            </div>
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
            <div className="flex flex-col gap-4">
                {allProducts.map((watchlistProduct: OverviewProduct) => (
                    <ProductCard key={watchlistProduct.productId} product={watchlistProduct} />
                ))}
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
        </div>
    );
}
