import { CategoryProductCard } from "@/components/category/CategoryProductCard.tsx";
import { CategoryProductCardSkeleton } from "@/components/category/CategoryProductCardSkeleton.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { SectionInfoText } from "@/components/typography/SectionInfoText.tsx";
import type { SearchResultData } from "@/data/internal/search/SearchResultData.ts";
import { useEffect } from "react";
import { AlertCircle, SearchX } from "lucide-react";
import { useTranslation } from "react-i18next";
import { H3 } from "@/components/typography/H3.tsx";
import { ListLoaderRow } from "@/components/common/ListLoaderRow.tsx";
import { useCategoryProducts } from "@/hooks/category/useCategoryProducts.ts";
import type { SortProductFieldData } from "@/client";
import { useInView } from "react-intersection-observer";

type CategoryProductSectionProps = {
    readonly categoryId: string;
    readonly title: string;
    readonly sort?: SortProductFieldData;
    readonly order?: "asc" | "desc";
};

const SKELETON_COUNT = 8;

export function CategoryProductSection({
    categoryId,
    title,
    sort,
    order,
}: CategoryProductSectionProps) {
    const { t } = useTranslation();
    const { data, isPending, error, fetchNextPage, isFetchingNextPage, hasNextPage } =
        useCategoryProducts({ categoryId, sort, order });

    const { ref: loadMoreRef, inView } = useInView({ threshold: 0 });

    const allProducts = data?.pages.flatMap((page: SearchResultData) => page.products) ?? [];
    const totalProducts = data?.pages[0]?.total ?? 0;
    const allLoaded = allProducts.length >= totalProducts && totalProducts > 0;

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    return (
        <section>
            <H2 className="mb-6">{title}</H2>

            {isPending && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: SKELETON_COUNT }, (_, i) => `skeleton-${i}`).map((id) => (
                        <CategoryProductCardSkeleton key={id} />
                    ))}
                </div>
            )}

            {error && (
                <div className="flex flex-col items-center gap-4 py-16">
                    <AlertCircle className="h-16 w-16 text-muted-foreground" />
                    <div className="text-center space-y-2">
                        <H3>{t("category.error.title")}</H3>
                        <SectionInfoText>{t("category.error.description")}</SectionInfoText>
                    </div>
                </div>
            )}

            {!isPending && !error && allProducts.length === 0 && (
                <div className="flex flex-col items-center gap-4 py-16">
                    <SearchX className="h-16 w-16 text-muted-foreground" />
                    <div className="text-center space-y-2">
                        <H3>{t("category.noProducts.title")}</H3>
                        <SectionInfoText>{t("category.noProducts.description")}</SectionInfoText>
                    </div>
                </div>
            )}

            {!isPending && !error && allProducts.length > 0 && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {allProducts.map((product) => (
                            <CategoryProductCard key={product.productId} product={product} />
                        ))}
                    </div>

                    <div ref={loadMoreRef} className="mt-6">
                        {(isFetchingNextPage || allLoaded) && (
                            <ListLoaderRow
                                isFetchingNextPage={isFetchingNextPage}
                                totalCount={totalProducts}
                                loadingMoreKey="category.loadingMore"
                                allLoadedKey="category.allLoaded"
                            />
                        )}
                    </div>
                </>
            )}
        </section>
    );
}
