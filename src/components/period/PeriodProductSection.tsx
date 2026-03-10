import { ProductCard } from "@/components/product/overview/ProductCard.tsx";
import { ProductCardSkeleton } from "@/components/product/overview/ProductCardSkeleton.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import type { OverviewProduct } from "@/data/internal/product/OverviewProduct.ts";
import { useTranslation } from "react-i18next";

type PeriodProductSectionProps = {
    readonly title: string;
    readonly products: OverviewProduct[];
    readonly isLoading: boolean;
};

const SKELETON_IDS = ["skeleton-1", "skeleton-2", "skeleton-3"] as const;

export function PeriodProductSection({ title, products, isLoading }: PeriodProductSectionProps) {
    const { t } = useTranslation();

    return (
        <section className="flex flex-col gap-4">
            <H2>{title}</H2>
            {isLoading ? (
                <div className="flex flex-col gap-4">
                    {SKELETON_IDS.map((id) => (
                        <ProductCardSkeleton key={id} />
                    ))}
                </div>
            ) : products.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center">{t("period.noProducts")}</p>
            ) : (
                <div className="flex flex-col gap-4">
                    {products.map((product) => (
                        <ProductCard key={product.productId} product={product} />
                    ))}
                </div>
            )}
        </section>
    );
}
