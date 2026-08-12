import { createFileRoute, redirect } from "@tanstack/react-router";
import { getProductOptions } from "@/client/@tanstack/react-query.gen";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import i18n from "@/i18n/i18n.ts";
import { validateBreadcrumbSearch } from "@/data/internal/common/BreadcrumbOrigin.ts";

export const Route = createFileRoute("/product/$shopId/$shopsProductId")({
    validateSearch: validateBreadcrumbSearch,
    loader: async ({ context: { queryClient }, params: { shopId, shopsProductId }, location }) => {
        const productData = await queryClient.ensureQueryData(
            getProductOptions({
                query: {
                    language: parseLanguage(i18n.language),
                },
                path: { shopId, shopsProductId },
            }),
        );

        throw redirect({
            to: "/shops/$shopSlugId/products/$productSlugId",
            params: {
                shopSlugId: productData.item.shopSlugId,
                productSlugId: productData.item.productSlugId,
            },
            search: location.search,
            statusCode: 301,
        });
    },
});
