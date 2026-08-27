import { useSearchFilterMatchedProducts } from "@/features/saved-searches/api/useSearchFilterMatchedProducts.ts";
import { SearchFilterMatchCard } from "@/features/saved-searches/components/match/SearchFilterMatchCard.tsx";
import { HiddenMatchCard } from "@/features/product/catalog/components/cards/HiddenMatchCard.tsx";
import { ProductCardSkeleton } from "@/features/product/catalog/components/cards/ProductCardSkeleton.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { SearchX, ServerCrash } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState.tsx";
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
    const { data, isPending, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useSearchFilterMatchedProducts(filterId);

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const allProducts: OverviewProduct[] = data?.pages.flatMap((page) => [...page.items]) ?? [];
    const totalProducts = data?.pages[0]?.total ?? 0;
    const allLoaded = !hasNextPage && allProducts.length > 0;
    const showLoaderRow = isFetchingNextPage || allLoaded;

    function renderResults() {
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
            return (
                <EmptyState
                    icon={ServerCrash}
                    title={t("searchFilters.loadingError.title")}
                    description={t("searchFilters.loadingError.description")}
                />
            );
        }

        if (allProducts.length === 0) {
            return (
                <EmptyState
                    icon={SearchX}
                    title={t("searchFilters.noMatches.title")}
                    description={t("searchFilters.noMatches.description")}
                >
                    <Button variant="outline" asChild>
                        <Link to="/$lng/me/search-filters" params={true} from="/$lng">
                            {t("searchFilters.noMatches.editHint")}
                        </Link>
                    </Button>
                </EmptyState>
            );
        }

        return (
            <>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    {allProducts.map((product: OverviewProduct, index) => {
                        const isHidden = product.userData?.searchFilterData?.hidden === true;
                        const key = isHidden ? `hidden-${index}` : product.productId;

                        return isHidden ? (
                            <HiddenMatchCard key={key} />
                        ) : (
                            <SearchFilterMatchCard
                                key={key}
                                product={product}
                                filterId={filterId}
                            />
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
            </>
        );
    }

    return (
        <div className="flex flex-col w-full gap-8">
            <div className="flex flex-col gap-1">
                <div className="flex flex-row items-center justify-between">
                    <H2>{t("searchFilters.matches")}</H2>
                    {!isPending && !error && (
                        <span className="text-xl font-semibold whitespace-nowrap">
                            {t("searchFilters.matchesCount", { count: totalProducts })}
                        </span>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">{t("searchFilters.matchesHint")}</p>
            </div>
            {renderResults()}
        </div>
    );
}
