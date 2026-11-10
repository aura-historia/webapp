import { createFileRoute } from "@tanstack/react-router";
import i18n from "@/i18n/i18n.ts";
import {
    adminListingSourceListQueryOptions,
    createAdminListingSourceErrorFactory,
} from "@/features/admin/listing-source-management/api/useAdminListingSources.ts";
import {
    fromAdminListingSourceUrlSearch,
    toAdminListingSourceUrlSearch,
    validateAdminListingSourceUrlSearch,
    withoutAdminListingSourceSelection,
} from "@/features/admin/listing-source-management/lib/adminListingSourceSearch.ts";
import { AdminListingSourcesPage } from "@/features/admin/listing-source-management/pages/AdminListingSourcesPage.tsx";

export const Route = createFileRoute("/$lng/_auth/admin/listing-sources")({
    validateSearch: validateAdminListingSourceUrlSearch,
    loaderDeps: ({ search }) =>
        withoutAdminListingSourceSelection(fromAdminListingSourceUrlSearch(search)),
    // The backend enforces admin authorization; prefetch failures fall back to the client query.
    loader: ({ context: { queryClient }, deps, params: { lng } }) =>
        queryClient.prefetchInfiniteQuery(
            adminListingSourceListQueryOptions(
                deps,
                createAdminListingSourceErrorFactory(i18n.getFixedT(lng)),
            ),
        ),
    component: AdminListingSourcesRoute,
});

function AdminListingSourcesRoute() {
    const search = fromAdminListingSourceUrlSearch(Route.useSearch());
    const navigate = Route.useNavigate();

    return (
        <AdminListingSourcesPage
            filters={withoutAdminListingSourceSelection(search)}
            selectedSourceId={search.source}
            onFiltersChange={(filters) =>
                navigate({
                    search: (previous) => ({
                        ...toAdminListingSourceUrlSearch(filters),
                        source: previous.source,
                    }),
                    replace: true,
                })
            }
            onSourceSelect={(source) =>
                navigate({ search: (previous) => ({ ...previous, source }), replace: true })
            }
        />
    );
}
