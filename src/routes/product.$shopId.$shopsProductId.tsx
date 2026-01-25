import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getProductOptions } from "@/client/@tanstack/react-query.gen";
import { mapToDetailProduct } from "@/data/internal/product/ProductDetails.ts";
import { ProductDetailPage } from "@/components/product/detail/ProductDetailPage.tsx";
import { ProductDetailPageSkeleton } from "@/components/product/detail/ProductDetailPageSkeleton.tsx";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import i18n from "@/i18n/i18n.ts";
import { useTranslation } from "react-i18next";
import { NotFoundComponent } from "@/components/common/NotFoundComponent.tsx";

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
    errorComponent: NotFoundComponent,
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

    const product = mapToDetailProduct(apiData, i18n.language);

    return <ProductDetailPage product={product} />;
}
