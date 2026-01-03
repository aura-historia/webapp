import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getProductOptions } from "@/client/@tanstack/react-query.gen";
import { mapToDetailProduct } from "@/data/internal/ProductDetails";
import { ProductDetailPage } from "@/components/product/detail/ProductDetailPage.tsx";
import { ProductDetailPageSkeleton } from "@/components/product/detail/ProductDetailPageSkeleton.tsx";
import { parseLanguage } from "@/data/internal/Language.ts";
import i18n from "@/i18n/i18n.ts";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/product/$shopId/$shopsProductId")({
    loader: ({ context: { queryClient }, params: { shopId, shopsProductId } }) => {
        return queryClient.ensureQueryData(
            getProductOptions({
                headers: {
                    "Accept-Language": parseLanguage(i18n.language),
                },
                path: { shopId, shopsProductId },
                query: { history: true },
            }),
        );
    },
    pendingComponent: ProductDetailPageSkeleton,
    component: ProductDetailComponent,
});

function ProductDetailComponent() {
    const { shopId, shopsProductId } = Route.useParams();
    const { i18n } = useTranslation();

    const { data: apiData } = useSuspenseQuery(
        getProductOptions({
            headers: {
                "Accept-Language": parseLanguage(i18n.language),
            },
            path: { shopId, shopsProductId },
            query: { history: true },
        }),
    );

    const product = mapToDetailProduct(apiData);

    return <ProductDetailPage product={product} />;
}
