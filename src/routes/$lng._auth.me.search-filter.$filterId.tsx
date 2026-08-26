import { createFileRoute } from "@tanstack/react-router";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";
import { SearchFilterDetailPage } from "@/features/saved-searches/pages/SearchFilterDetailPage.tsx";

export const Route = createFileRoute("/$lng/_auth/me/search-filter/$filterId")({
    head: () =>
        generatePageHeadMeta({
            pageKey: "searchFilters",
            noIndex: true,
        }),
    component: RouteComponent,
});

function RouteComponent() {
    const { filterId } = Route.useParams();

    return <SearchFilterDetailPage filterId={filterId} />;
}
