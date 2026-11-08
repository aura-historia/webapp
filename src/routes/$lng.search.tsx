import { createFileRoute } from "@tanstack/react-router";

import { ProductSearchPage } from "@/features/search/products/pages/ProductSearchPage.tsx";
import {
    validateSearchParams,
    validateSearchUrlParams,
} from "@/features/search/products/lib/searchValidation.ts";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";

export const Route = createFileRoute("/$lng/search")({
    head: () =>
        // Result pages are endless filter combinations: keep them out of the index, but let
        // crawlers follow their links to listings and sources. No canonical: the bare path
        // redirects to its default search parameters.
        generatePageHeadMeta({
            pageKey: "search",
            noIndex: true,
            followLinks: true,
        }),
    validateSearch: validateSearchUrlParams,
    component: ProductSearchRoute,
});

function ProductSearchRoute() {
    return <ProductSearchPage searchArgs={validateSearchParams(Route.useSearch())} />;
}
