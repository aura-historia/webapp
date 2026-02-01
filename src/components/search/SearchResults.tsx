import { ProductCardSkeleton } from "@/components/product/overview/ProductCardSkeleton.tsx";
import { SectionInfoText } from "@/components/typography/SectionInfoText.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { SearchX } from "lucide-react";
import type { SearchResultData } from "@/data/internal/search/SearchResultData.ts";
import type { OverviewProduct } from "@/data/internal/product/OverviewProduct.ts";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import { useSearch } from "@/hooks/search/useSearch.ts";
import Lottie from "lottie-react";
import tick from "@/assets/lottie/tick.json";
import { Spinner } from "@/components/ui/spinner.tsx";
import { useTranslation } from "react-i18next";
import { H3 } from "@/components/typography/H3.tsx";
import { VirtualizedProductList } from "@/components/product/overview/VirtualizedProductList.tsx";

type SearchResultsProps = {
    readonly searchFilters: SearchFilterArguments;
    readonly onTotalChange?: (total: number) => void;
};

export function SearchResults({ searchFilters, onTotalChange }: SearchResultsProps) {
    const { ref, inView } = useInView();
    const { t } = useTranslation();
    const { data, isPending, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useSearch(searchFilters);

    useEffect(() => {
        if (data?.pages[0]?.total !== undefined && onTotalChange) {
            onTotalChange(data.pages[0].total);
        }
    }, [data?.pages[0]?.total, onTotalChange]);

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage && searchFilters.q.length >= 3) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage, searchFilters.q.length]);

    if (searchFilters.q.length < 3) {
        return <SectionInfoText>{t("search.messages.minQueryLength")}</SectionInfoText>;
    }

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

        return <SectionInfoText>{t("search.messages.error")}</SectionInfoText>;
    }

    const allProducts: OverviewProduct[] =
        data?.pages.flatMap((page: SearchResultData) => page.products) ?? [];

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
        <div className="flex flex-col gap-4">
            <VirtualizedProductList
                products={allProducts}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={fetchNextPage}
            />
            <Card className={"p-4 flex justify-center items-center shadow-md"} ref={ref}>
                <CardContent className="flex justify-center items-center w-full px-2">
                    {isFetchingNextPage ? (
                        <div className={"flex flex-row items-center gap-2"}>
                            <Spinner />
                            <SectionInfoText>{t("search.messages.loadingMore")}</SectionInfoText>
                        </div>
                    ) : hasNextPage ? (
                        ""
                    ) : (
                        <div className={"flex flex-row items-center gap-2"}>
                            <div className={"h-12 w-12 shrink-0"}>
                                <Lottie className={"h-12 w-12"} animationData={tick} loop={false} />
                            </div>
                            <SectionInfoText>
                                {t("search.messages.allLoaded", { count: data?.pages[0]?.total })}
                            </SectionInfoText>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
