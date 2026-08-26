import { ShopSearchPage } from "@/features/search/shops/pages/ShopSearchPage.tsx";
import { createFileRoute } from "@tanstack/react-router";
import { validateShopSearchParams } from "@/features/search/shops/lib/shopSearchValidation.ts";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";
import { env } from "@/env";

export const Route = createFileRoute("/$lng/search_/shops")({
    head: () =>
        generatePageHeadMeta({
            pageKey: "searchShops",
            url: `${env.VITE_APP_URL}/search/shops`,
        }),
    validateSearch: validateShopSearchParams,
    component: RouteComponent,
});

function RouteComponent() {
    return <ShopSearchPage searchArgs={Route.useSearch()} />;
}
