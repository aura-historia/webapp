import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getShopBySlugOptions } from "@/client/@tanstack/react-query.gen";
import { mapToShopDetail } from "@/data/internal/shop/ShopDetail.ts";
import { generateShopHeadMeta } from "@/features/shop/profile/lib/shopHeadMeta.ts";
import { ShopPageSkeleton } from "@/features/shop/profile/components/ShopPageSkeleton.tsx";
import { ShopProfilePage } from "@/features/shop/profile/pages/ShopProfilePage.tsx";
import { useMemo } from "react";
import { isApiNotFoundError } from "@/lib/api/apiError.ts";

export const Route = createFileRoute("/$lng/shops/$shopSlugId/")({
    loader: async ({ context: { queryClient }, params: { shopSlugId } }) => {
        try {
            return await queryClient.ensureQueryData(
                getShopBySlugOptions({
                    path: { shopSlugId },
                }),
            );
        } catch (error) {
            if (isApiNotFoundError(error)) {
                throw notFound();
            }

            throw error;
        }
    },
    head: ({ loaderData, params }) => generateShopHeadMeta(loaderData, params),
    pendingComponent: ShopPageSkeleton,
    component: ShopProfileRoute,
});

function ShopProfileRoute() {
    const { shopSlugId } = Route.useParams();

    const { data } = useSuspenseQuery(
        getShopBySlugOptions({
            path: { shopSlugId },
        }),
    );

    const shop = useMemo(() => mapToShopDetail(data), [data]);

    return <ShopProfilePage shop={shop} />;
}
