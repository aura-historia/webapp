import { createFileRoute } from "@tanstack/react-router";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";
import { SearchFilterDetail } from "@/components/search-filters/detail/SearchFilterDetail.tsx";
import {
    toBreadcrumbOrigin,
    validateBreadcrumbSearch,
} from "@/data/internal/common/BreadcrumbOrigin.ts";

export const Route = createFileRoute("/_auth/me/search-filter/$filterId")({
    validateSearch: validateBreadcrumbSearch,
    head: () =>
        generatePageHeadMeta({
            pageKey: "searchFilters",
            noIndex: true,
        }),
    component: RouteComponent,
});

function RouteComponent() {
    const { filterId } = Route.useParams();
    const origin = toBreadcrumbOrigin(Route.useSearch());

    return (
        <div className="max-w-6xl mx-auto flex flex-col gap-8 py-8 px-8">
            <SearchFilterDetail filterId={filterId} origin={origin} />
        </div>
    );
}
