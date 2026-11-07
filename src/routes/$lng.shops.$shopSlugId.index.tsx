import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getPublicListingSourceBySlugOptions } from "@/client/@tanstack/react-query.gen";
import { mapPublicListingSource } from "@/data/internal/shop/PublicListingSource.ts";
import { generateShopHeadMeta } from "@/features/shop/profile/lib/shopHeadMeta.ts";
import { validateShopProfileSearch } from "@/features/shop/profile/lib/shopProfileSearch.ts";
import { ShopNotFound } from "@/features/shop/profile/components/ShopNotFound.tsx";
import { ShopPageSkeleton } from "@/features/shop/profile/components/ShopPageSkeleton.tsx";
import { ShopProfilePage } from "@/features/shop/profile/pages/ShopProfilePage.tsx";
import { useCallback, useMemo } from "react";
import { isApiNotFoundError } from "@/lib/api/apiError.ts";

// Keep the established /shops/:slug URL for existing links; it resolves only public
// listing-source slugs, so a legacy shop slug 404s unless a source now holds that readable slug.
export const Route = createFileRoute("/$lng/shops/$shopSlugId/")({
    validateSearch: validateShopProfileSearch,
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
    notFoundComponent: ShopNotFound,
    component: ShopProfileRoute,
});

function ShopProfileRoute() {
    const { shopSlugId } = Route.useParams();
    const { q } = Route.useSearch();
    const navigate = Route.useNavigate();

    const { data } = useSuspenseQuery(
        getPublicListingSourceBySlugOptions({
            path: { listingSourceSlugId: shopSlugId },
        }),
    );

    const shop = useMemo(() => mapPublicListingSource(data), [data]);

    // Replace rather than push, so typing a search does not fill the history.
    const handleQueryChange = useCallback(
        (query: string) => {
            void navigate({
                search: (previous) => ({ ...previous, q: query || undefined }),
                replace: true,
                resetScroll: false,
            });
        },
        [navigate],
    );

    return <ShopProfilePage shop={shop} query={q ?? ""} onQueryChange={handleQueryChange} />;
}
