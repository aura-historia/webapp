import { ShopSearchPage } from "@/features/search/shops/pages/ShopSearchPage.tsx";
import { createFileRoute } from "@tanstack/react-router";
import { validateShopSearchParams } from "@/features/search/shops/lib/shopSearchValidation.ts";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";

export const Route = createFileRoute("/$lng/search_/shops")({
    head: () =>
        // Result pages are endless filter combinations: keep them out of the index, but let
        // crawlers follow their links to listings and sources. No canonical: the bare path
        // redirects to its default search parameters.
        generatePageHeadMeta({
            pageKey: "searchShops",
            noIndex: true,
            followLinks: true,
        }),
    validateSearch: validateShopSearchParams,
    component: RouteComponent,
});

function RouteComponent() {
    return <ShopSearchPage searchArgs={Route.useSearch()} />;
}
