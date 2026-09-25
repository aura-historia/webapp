import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getProductBySlugOptions } from "@/client/@tanstack/react-query.gen";
import { mapToDetailProduct } from "@/data/internal/product/ProductDetails.ts";
import { ProductDetailPage } from "@/features/product/detail/pages/ProductDetailPage.tsx";
import { ProductDetailPageSkeleton } from "@/features/product/detail/components/ProductDetailPageSkeleton.tsx";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import { useTranslation } from "react-i18next";
import { useUserPreferences } from "@/features/preferences/hooks/useUserPreferences.tsx";
import { generateProductHeadMeta } from "@/features/product/detail/lib/seo/productHeadMeta.ts";
import { isApiNotFoundError } from "@/lib/api/apiError.ts";

export const Route = createFileRoute("/$lng/shops/$shopSlugId/products/$productSlugId")({
    loader: async ({
        context: { queryClient, initialPreferences },
        params: { lng, shopSlugId, productSlugId },
    }) => {
        const currency = initialPreferences.currency;
        const productData = await queryClient
            .ensureQueryData(
                getProductBySlugOptions({
                    query: {
                        language: parseLanguage(lng),
                        currency: currency,
                    },
                    path: { shopSlugId, productSlugId },
                }),
            )
            .catch((error) => {
                if (isApiNotFoundError(error)) {
                    throw notFound();
                }

                throw error;
            });

        return productData;
    },
    head: ({ loaderData, params }) => generateProductHeadMeta(loaderData, params),
    pendingComponent: ProductDetailPageSkeleton,
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

    const product = mapToDetailProduct(apiData, i18n.language);

    return <ProductDetailPage product={product} />;
}
