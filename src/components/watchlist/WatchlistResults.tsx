import { ProductCard } from "@/components/product/overview/ProductCard.tsx";
import { ProductCardSkeleton } from "@/components/product/overview/ProductCardSkeleton.tsx";
import { SectionInfoText } from "@/components/typography/SectionInfoText.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { H1 } from "@/components/typography/H1.tsx";
import { useTranslation } from "react-i18next";
import type { OverviewProduct } from "@/data/internal/product/OverviewProduct.ts";
import { Spinner } from "@/components/ui/spinner.tsx";
import Lottie from "lottie-react";
import tick from "@/assets/lottie/tick.json";
import { SearchX } from "lucide-react";
import { H3 } from "@/components/typography/H3.tsx";
import { useWatchlist } from "@/hooks/watchlist/useWatchlist.ts";

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
                {Array.from({ length: 4 }, () => (
                    <ProductCardSkeleton key={uuidv4()} />
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
                        count: data.pages[0].total ?? 0,
                    })}
                </span>
            </div>
            <div className="flex flex-col gap-4">
                {allProducts.map((watchlistProduct: OverviewProduct) => (
                    <ProductCard key={watchlistProduct.productId} product={watchlistProduct} />
                ))}
                <Card className={"p-4 flex justify-center items-center shadow-md"} ref={ref}>
                    <CardContent className="flex justify-center items-center w-full px-2">
                        {isFetchingNextPage ? (
                            <div className={"flex flex-row items-center gap-2"}>
                                <Spinner />
                                <SectionInfoText>{t("watchlist.loadingMore")}</SectionInfoText>
                            </div>
                        ) : hasNextPage ? (
                            ""
                        ) : (
                            <div className={"flex flex-row items-center gap-2"}>
                                <div className={"h-12 w-12 shrink-0"}>
                                    <Lottie
                                        className={"h-12 w-12"}
                                        animationData={tick}
                                        loop={false}
                                    />
                                </div>
                                <SectionInfoText>
                                    {t("watchlist.allLoaded", {
                                        count: data?.pages[0]?.total,
                                    })}
                                </SectionInfoText>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
