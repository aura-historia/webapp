import { useSimilarProducts } from "@/hooks/useSimilarProducts.ts";
import { ProductSimilarCard } from "@/components/product/detail/similar/ProductSimilarCard.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { H3 } from "@/components/typography/H3.tsx";
import { useTranslation } from "react-i18next";
import { AlertCircle, SearchX, RefreshCw } from "lucide-react";
import { ProductSimilarCardSkeleton } from "@/components/product/detail/similar/ProductSimilarCardSkeleton.tsx";
import type { ReactNode } from "react";

interface ProductSimilarProps {
    readonly shopId: string;
    readonly shopsProductId: string;
}

function SimilarSectionHeading({ title }: { readonly title: string }) {
    return (
        <div>
            <H2 className="font-display text-2xl font-normal text-primary">{title}</H2>
            <span className="mt-4 block h-0.5 w-12 bg-primary" />
        </div>
    );
}

function SimilarState({
    title,
    icon,
    description,
}: {
    readonly title: string;
    readonly icon: ReactNode;
    readonly description: string;
}) {
    return (
        <div className="flex min-w-0 flex-col gap-4 bg-card p-6">
            <div className="flex flex-col items-center gap-4 py-8">
                {icon}
                <div className="space-y-2 text-center">
                    <H3>{title}</H3>
                    <p className="text-base text-muted-foreground">{description}</p>
                </div>
            </div>
        </div>
    );
}

export function ProductSimilar({ shopId, shopsProductId }: ProductSimilarProps) {
    const { t } = useTranslation();
    const { data, isLoading, isError, error } = useSimilarProducts(shopId, shopsProductId);

    if (isLoading) {
        return (
            <section className="flex min-w-0 flex-col gap-8">
                <SimilarSectionHeading title={t("product.similar.title")} />
                <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
                    {["skeleton-1", "skeleton-2", "skeleton-3", "skeleton-4"].map((skeletonId) => (
                        <ProductSimilarCardSkeleton key={skeletonId} />
                    ))}
                </div>
            </section>
        );
    }

    if (isError) {
        return (
            <section className="flex min-w-0 flex-col gap-8">
                <SimilarSectionHeading title={t("product.similar.title")} />
                <SimilarState
                    title={t("product.similar.error.title")}
                    icon={<AlertCircle className="h-16 w-16 text-muted-foreground" />}
                    description={error?.message ?? t("product.similar.error.description")}
                />
            </section>
        );
    }

    if (data?.isEmbeddingsPending) {
        return (
            <section className="flex min-w-0 flex-col gap-8">
                <SimilarSectionHeading title={t("product.similar.title")} />
                <SimilarState
                    title={t("product.similar.embeddingsPending.title")}
                    icon={
                        <RefreshCw className="h-16 w-16 animate-[spin_2s_linear_infinite] text-muted-foreground" />
                    }
                    description={t("product.similar.embeddingsPending.description")}
                />
            </section>
        );
    }

    if (!data?.products || data.products.length === 0) {
        return (
            <section className="flex min-w-0 flex-col gap-8">
                <SimilarSectionHeading title={t("product.similar.title")} />
                <SimilarState
                    title={t("product.similar.noData.title")}
                    icon={<SearchX className="h-16 w-16 text-muted-foreground" />}
                    description={t("product.similar.noData.description")}
                />
            </section>
        );
    }

    return (
        <section className="flex min-w-0 flex-col gap-8">
            <SimilarSectionHeading title={t("product.similar.title")} />
            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
                {data.products.map((product) => (
                    <ProductSimilarCard key={product.productId} product={product} />
                ))}
            </div>
        </section>
    );
}
