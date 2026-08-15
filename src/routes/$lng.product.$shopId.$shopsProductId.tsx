import { createFileRoute, redirect } from "@tanstack/react-router";
import { getProductOptions } from "@/client/@tanstack/react-query.gen";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import i18n from "@/i18n/i18n.ts";

export const Route = createFileRoute("/$lng/product/$shopId/$shopsProductId")({
    loader: async ({ context: { queryClient }, params: { lng, shopId, shopsProductId } }) => {
        const productData = await queryClient.ensureQueryData(
            getProductOptions({
                query: {
                    language: parseLanguage(i18n.language),
                },
                path: { shopId, shopsProductId },
            }),
        );

        throw redirect({
            to: "/$lng/shops/$shopSlugId/products/$productSlugId",
            params: {
                lng,
                shopSlugId: productData.item.shopSlugId,
                productSlugId: productData.item.productSlugId,
            },
            statusCode: 301,
        });
    },
});
