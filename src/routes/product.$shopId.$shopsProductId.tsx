import { createFileRoute, redirect } from "@tanstack/react-router";
import { getProductOptions } from "@/client/@tanstack/react-query.gen";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import i18n from "@/i18n/i18n.ts";

export const Route = createFileRoute("/product/$shopId/$shopsProductId")({
    loader: async ({ context: { queryClient }, params: { shopId, shopsProductId } }) => {
        const productData = await queryClient.ensureQueryData(
            getProductOptions({
                headers: {
                    "Accept-Language": parseLanguage(i18n.language),
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
            statusCode: 301,
        });
    },
});
