import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getProductListingByTitleSlugOptions } from "@/client/@tanstack/react-query.gen";
import { mapToDetailProduct } from "@/data/internal/product/ProductDetails.ts";
import { ProductDetailPage } from "@/features/product/detail/pages/ProductDetailPage.tsx";
import { ProductDetailPageSkeleton } from "@/features/product/detail/components/ProductDetailPageSkeleton.tsx";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import { useTranslation } from "react-i18next";
import { useUserPreferences } from "@/features/preferences/hooks/useUserPreferences.tsx";
import { generateProductHeadMeta } from "@/features/product/detail/lib/seo/productHeadMeta.ts";
import { isApiNotFoundError } from "@/lib/api/apiError.ts";

export const Route = createFileRoute("/$lng/products/$productListingTitleSlugId")({
    loader: async ({
        context: { queryClient, initialPreferences },
        params: { lng, productListingTitleSlugId },
    }) => {
        const productData = await queryClient
            .ensureQueryData(
                getProductListingByTitleSlugOptions({
                    query: {
                        language: parseLanguage(lng),
                        currency: initialPreferences.currency,
                    },
                    path: { productListingTitleSlugId },
                }),
            )
            .catch((error) => {
                if (isApiNotFoundError(error)) throw notFound();
                throw error;
            });

        return productData;
    },
    head: ({ loaderData, params }) => generateProductHeadMeta(loaderData, params),
    pendingComponent: ProductDetailPageSkeleton,
    component: ProductDetailComponent,
});

function ProductDetailComponent() {
    const { productListingTitleSlugId } = Route.useParams();
    const { i18n } = useTranslation();
    const { preferences } = useUserPreferences();

    const { data: apiData } = useSuspenseQuery(
        getProductListingByTitleSlugOptions({
            query: {
                language: parseLanguage(i18n.language),
                currency: preferences.currency,
            },
            path: { productListingTitleSlugId },
        }),
    );

    const product = mapToDetailProduct(apiData, i18n.language);

    return <ProductDetailPage product={product} productListingId={product.productListingId} />;
}
