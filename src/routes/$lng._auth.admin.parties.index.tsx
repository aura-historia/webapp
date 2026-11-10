import { createFileRoute } from "@tanstack/react-router";
import i18n from "@/i18n/i18n.ts";
import {
    adminPartyListQueryOptions,
    createAdminPartyErrorFactory,
} from "@/features/admin/party-management/api/useAdminParties.ts";
import { validateAdminPartySearch } from "@/features/admin/party-management/lib/adminPartySearch.ts";
import { AdminPartiesPage } from "@/features/admin/party-management/pages/AdminPartiesPage.tsx";

export const Route = createFileRoute("/$lng/_auth/admin/parties/")({
    validateSearch: validateAdminPartySearch,
    loaderDeps: ({ search }) => search,
    // The backend enforces admin authorization; prefetch failures fall back to the client query.
    loader: ({ context: { queryClient }, params: { lng }, deps }) =>
        queryClient.prefetchInfiniteQuery(
            adminPartyListQueryOptions(deps, createAdminPartyErrorFactory(i18n.getFixedT(lng))),
        ),
    component: AdminPartiesRoute,
});

function AdminPartiesRoute() {
    const filters = Route.useSearch();
    const navigate = Route.useNavigate();
    return (
        <AdminPartiesPage
            filters={filters}
            onFiltersChange={(next) => navigate({ search: next, replace: true })}
        />
    );
}
