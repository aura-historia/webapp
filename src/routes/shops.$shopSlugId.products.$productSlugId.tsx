import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
    getProductBySlugOptions,
    getProductHistoryOptions,
} from "@/client/@tanstack/react-query.gen";
import { mapToDetailProduct } from "@/data/internal/product/ProductDetails.ts";
import { ProductDetailPage } from "@/components/product/detail/ProductDetailPage.tsx";
import { ProductDetailPageSkeleton } from "@/components/product/detail/ProductDetailPageSkeleton.tsx";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import i18n from "@/i18n/i18n.ts";
import { useTranslation } from "react-i18next";
import { useUserPreferences } from "@/hooks/preferences/useUserPreferences.tsx";
import { generateProductHeadMeta } from "@/lib/seo/productHeadMeta.ts";
import { NotFoundComponent } from "@/components/common/NotFoundComponent.tsx";

export const Route = createFileRoute("/shops/$shopSlugId/products/$productSlugId")({
    loader: async ({
        context: { queryClient, initialPreferences },
        params: { shopSlugId, productSlugId },
    }) => {
        const currency = initialPreferences.currency;
        const productData = await queryClient.ensureQueryData(
            getProductBySlugOptions({
                query: {
                    language: parseLanguage(i18n.language),
                    currency: currency,
                },
                path: { shopSlugId, productSlugId },
            }),
        );

        await queryClient.ensureQueryData(
            getProductHistoryOptions({
                query: {
                    language: parseLanguage(i18n.language),
                    currency: currency,
                },
                path: {
                    shopId: productData.item.shopId,
                    shopsProductId: productData.item.shopsProductId,
                },
            }),
        );

        return productData;
    },
    head: ({ loaderData, params }) => generateProductHeadMeta(loaderData, params),
    pendingComponent: ProductDetailPageSkeleton,
    errorComponent: NotFoundComponent,
    component: ProductDetailComponent,
});

function ProductDetailComponent() {
    const { shopSlugId, productSlugId } = Route.useParams();
    const { i18n } = useTranslation();
    const { preferences } = useUserPreferences();

    const { data: apiData } = useSuspenseQuery(
        getProductBySlugOptions({
            query: {
                language: parseLanguage(i18n.language),
                currency: preferences.currency,
            },
            path: { shopSlugId, productSlugId },
        }),
    );

    const { data: historyData } = useSuspenseQuery(
        getProductHistoryOptions({
            query: {
                language: parseLanguage(i18n.language),
                currency: preferences.currency,
            },
            path: {
                shopId: apiData.item.shopId,
                shopsProductId: apiData.item.shopsProductId,
            },
        }),
    );

    const product = mapToDetailProduct(apiData, historyData, i18n.language);

    return <ProductDetailPage product={product} />;
}
