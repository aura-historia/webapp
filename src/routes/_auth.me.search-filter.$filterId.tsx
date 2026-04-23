import { createFileRoute } from "@tanstack/react-router";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";
import { SearchFilterMatches } from "@/components/search-filters/SearchFilterMatches.tsx";

export const Route = createFileRoute("/_auth/me/search-filter/$filterId")({
    head: () =>
        generatePageHeadMeta({
            pageKey: "searchFilters",
            noIndex: true,
        }),
    component: RouteComponent,
});

function RouteComponent() {
    const { filterId } = Route.useParams();

    return (
        <div className="max-w-6xl mx-auto flex flex-col gap-8 pt-8 pb-8 ml-8 mr-8 lg:ml-auto lg:mr-auto">
            <SearchFilterMatches filterId={filterId} />
        </div>
    );
}
