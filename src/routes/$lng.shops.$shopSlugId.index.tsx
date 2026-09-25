import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getPublicListingSourceBySlugOptions } from "@/client/@tanstack/react-query.gen";
import { mapPublicListingSource } from "@/data/internal/shop/PublicListingSource.ts";
import { generateShopHeadMeta } from "@/features/shop/profile/lib/shopHeadMeta.ts";
import { ShopPageSkeleton } from "@/features/shop/profile/components/ShopPageSkeleton.tsx";
import { ShopProfilePage } from "@/features/shop/profile/pages/ShopProfilePage.tsx";
import { useMemo } from "react";
import { isApiNotFoundError } from "@/lib/api/apiError.ts";

// Keep the established /shops/:slug URL for existing links; it now resolves only
// immutable public listing-source slugs and lets unknown legacy shop slugs 404.
export const Route = createFileRoute("/$lng/shops/$shopSlugId/")({
    loader: async ({ context: { queryClient }, params: { shopSlugId } }) => {
        try {
            const data = await queryClient.ensureQueryData(
                getPublicListingSourceBySlugOptions({
                    path: { listingSourceSlugId: shopSlugId },
                }),
            );
            return mapPublicListingSource(data);
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
        getPublicListingSourceBySlugOptions({
            path: { listingSourceSlugId: shopSlugId },
        }),
    );

    const shop = useMemo(() => mapPublicListingSource(data), [data]);

    return <ShopProfilePage shop={shop} />;
}
