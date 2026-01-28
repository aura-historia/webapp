import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getProductOptions, getProductHistoryOptions } from "@/client/@tanstack/react-query.gen";
import { mapToDetailProduct } from "@/data/internal/product/ProductDetails.ts";
import { ProductDetailPage } from "@/components/product/detail/ProductDetailPage.tsx";
import { ProductDetailPageSkeleton } from "@/components/product/detail/ProductDetailPageSkeleton.tsx";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import i18n from "@/i18n/i18n.ts";
import { useTranslation } from "react-i18next";
import { generateProductHeadMeta } from "@/lib/productHeadMeta.ts";
import { NotFoundComponent } from "@/components/common/NotFoundComponent.tsx";

export const Route = createFileRoute("/product/$shopId/$shopsProductId")({
    loader: async ({ context: { queryClient }, params: { shopId, shopsProductId } }) => {
        // Fetch product and history in parallel
        const [productData] = await Promise.all([
            queryClient.ensureQueryData(
                getProductOptions({
                    headers: {
                        "Accept-Language": parseLanguage(i18n.language),
                    },
                    path: { shopId, shopsProductId },
                }),
            ),
            queryClient.ensureQueryData(
                getProductHistoryOptions({
                    headers: {
                        "Accept-Language": parseLanguage(i18n.language),
                    },
                    path: { shopId, shopsProductId },
                }),
            ),
        ]);
        return productData;
    },
    head: ({ loaderData, params }) => generateProductHeadMeta(loaderData, params),
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
        }),
    );

    const { data: historyData } = useSuspenseQuery(
        getProductHistoryOptions({
            headers: {
                "Accept-Language": parseLanguage(i18n.language),
            },
            path: { shopId, shopsProductId },
        }),
    );

    const product = mapToDetailProduct(apiData, historyData, i18n.language);

    return <ProductDetailPage product={product} />;
}
