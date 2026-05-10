import { createFileRoute } from "@tanstack/react-router";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";
import { SearchFilterMatches } from "@/components/search-filters/match/SearchFilterMatches.tsx";

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
        <div className="max-w-6xl mx-auto flex flex-col gap-8 py-8 px-8">
            <SearchFilterMatches filterId={filterId} />
        </div>
    );
}
