import { createFileRoute } from "@tanstack/react-router";
import { SearchFilterResults } from "@/components/search-filters/SearchFilterResults.tsx";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";

export const Route = createFileRoute("/_auth/me/search-filters")({
    head: () =>
        generatePageHeadMeta({
            pageKey: "searchFilters",
            noIndex: true,
        }),
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div className="max-w-6xl mx-auto flex flex-col gap-8 pt-8 pb-8 ml-8 mr-8 lg:ml-auto lg:mr-auto">
            <SearchFilterResults />
        </div>
    );
}
