import { useUserSearchFilter } from "@/hooks/search-filters/useUserSearchFilter.ts";
import { useSearchFilterMatchedProducts } from "@/hooks/search-filters/useSearchFilterMatchedProducts.ts";
import { SearchFilterMatchCard } from "@/components/search-filters/SearchFilterMatchCard.tsx";
import { HiddenMatchCard } from "@/components/product/overview/HiddenMatchCard.tsx";
import { ProductCardSkeleton } from "@/components/product/overview/ProductCardSkeleton.tsx";
import { SectionInfoText } from "@/components/typography/SectionInfoText.tsx";
import { H1 } from "@/components/typography/H1.tsx";
import { H3 } from "@/components/typography/H3.tsx";
import { SearchX } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import type { OverviewProduct } from "@/data/internal/product/OverviewProduct.ts";
import { ListLoaderRow } from "@/components/common/ListLoaderRow.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Link } from "@tanstack/react-router";

type Props = {
    readonly filterId: string;
};

const SKELETON_IDS = ["skeleton-1", "skeleton-2", "skeleton-3", "skeleton-4"] as const;

export function SearchFilterMatches({ filterId }: Props) {
    const { ref, inView } = useInView();
    const { t } = useTranslation();
    const {
        data: filter,
        isPending: filterPending,
        error: filterError,
    } = useUserSearchFilter(filterId);
    const { data, isPending, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useSearchFilterMatchedProducts(filterId);

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (isPending || filterPending) {
        return (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {SKELETON_IDS.map((id) => (
                    <ProductCardSkeleton key={id} />
                ))}
            </div>
        );
    }

    if (error || filterError) {
        console.error(error ?? filterError);
        return <SectionInfoText>{t("searchFilters.loadingError")}</SectionInfoText>;
    }

    const allProducts: OverviewProduct[] = data?.pages.flatMap((page) => [...page.items]) ?? [];
    const totalProducts = data?.pages[0]?.total ?? 0;
    const allLoaded = allProducts.length >= totalProducts && totalProducts > 0;
    const showLoaderRow = isFetchingNextPage || allLoaded;

    if (allProducts.length === 0) {
        return (
            <div className="flex flex-col items-center gap-4 py-16">
                <SearchX className="h-16 w-16 text-muted-foreground" />
                <div className="text-center space-y-2">
                    <H3>{t("searchFilters.noMatches.title")}</H3>
                    <p className="text-base text-muted-foreground">
                        {t("searchFilters.noMatches.description")}
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link to="/me/search-filters">{t("searchFilters.noMatches.editHint")}</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full gap-8">
            <div className="flex flex-row items-center justify-between">
                <div className="flex flex-col gap-1">
                    <H1>{filter?.name}</H1>
                    {filter?.enhancedSearchDescription && (
                        <p className="text-base text-muted-foreground italic">
                            {filter.enhancedSearchDescription}
                        </p>
                    )}
                </div>
                <span className="text-2xl font-semibold whitespace-nowrap">
                    {t("searchFilters.totalElements", { count: totalProducts })}
                </span>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {allProducts.map((product: OverviewProduct, index) => {
                    const isHidden = product.userData?.searchFilterData?.hidden === true;
                    const key = isHidden ? `hidden-${index}` : product.productId;

                    return isHidden ? (
                        <HiddenMatchCard key={key} />
                    ) : (
                        <SearchFilterMatchCard key={key} product={product} filterId={filterId} />
                    );
                })}
            </div>
            {showLoaderRow && (
                <div ref={ref}>
                    <ListLoaderRow
                        isFetchingNextPage={isFetchingNextPage}
                        totalCount={totalProducts}
                    />
                </div>
            )}
        </div>
    );
}
