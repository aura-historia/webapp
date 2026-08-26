import { createFileRoute } from "@tanstack/react-router";
import { SearchFiltersPage } from "@/features/saved-searches/pages/SearchFiltersPage.tsx";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";

export const Route = createFileRoute("/$lng/_auth/me/search-filters")({
    head: () =>
        generatePageHeadMeta({
            pageKey: "searchFilters",
            noIndex: true,
        }),
    component: RouteComponent,
});

function RouteComponent() {
    return <SearchFiltersPage />;
}
