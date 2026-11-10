import { createFileRoute } from "@tanstack/react-router";
import i18n from "@/i18n/i18n.ts";
import {
    adminOAuthClientListQueryOptions,
    createAdminOAuthClientErrorFactory,
} from "@/features/admin/oauth-client-management/api/useAdminOAuthClients.ts";
import { validateAdminOAuthClientSearch } from "@/features/admin/oauth-client-management/lib/adminOAuthClientSearch.ts";
import { AdminOAuthClientsPage } from "@/features/admin/oauth-client-management/pages/AdminOAuthClientsPage.tsx";

export const Route = createFileRoute("/$lng/_auth/admin/oauth-clients")({
    validateSearch: validateAdminOAuthClientSearch,
    loaderDeps: ({ search }) => search,
    // The backend enforces admin authorization; prefetch failures fall back to the client query.
    loader: ({ context: { queryClient }, deps, params: { lng } }) =>
        queryClient.prefetchInfiniteQuery(
            adminOAuthClientListQueryOptions(
                deps,
                createAdminOAuthClientErrorFactory(i18n.getFixedT(lng)),
            ),
        ),
    component: AdminOAuthClientsRoute,
});

function AdminOAuthClientsRoute() {
    const filters = Route.useSearch();
    const navigate = Route.useNavigate();
    return (
        <AdminOAuthClientsPage
            filters={filters}
            onFiltersChange={(next) => navigate({ search: next, replace: true })}
        />
    );
}
