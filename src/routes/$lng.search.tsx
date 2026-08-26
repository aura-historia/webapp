import { createFileRoute } from "@tanstack/react-router";

import { ProductSearchPage } from "@/features/search/products/pages/ProductSearchPage.tsx";
import { validateSearchParams } from "@/features/search/products/lib/searchValidation.ts";
import { env } from "@/env";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";

export const Route = createFileRoute("/$lng/search")({
    head: () =>
        generatePageHeadMeta({
            pageKey: "search",
            url: `${env.VITE_APP_URL}/search`,
        }),
    validateSearch: validateSearchParams,
    component: ProductSearchRoute,
});

function ProductSearchRoute() {
    return <ProductSearchPage searchArgs={Route.useSearch()} />;
}
