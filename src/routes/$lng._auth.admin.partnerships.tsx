import { createFileRoute } from "@tanstack/react-router";
import i18n from "@/i18n/i18n.ts";
import {
    adminPartnershipListQueryOptions,
    createAdminPartnershipErrorFactory,
} from "@/features/admin/partnership-management/api/useAdminPartnerships.ts";
import {
    adminPartnershipFiltersOf,
    fromAdminPartnershipUrlSearch,
    toAdminPartnershipUrlSearch,
    validateAdminPartnershipUrlSearch,
} from "@/features/admin/partnership-management/lib/adminPartnershipSearch.ts";
import { AdminPartnershipsPage } from "@/features/admin/partnership-management/pages/AdminPartnershipsPage.tsx";

export const Route = createFileRoute("/$lng/_auth/admin/partnerships")({
    validateSearch: validateAdminPartnershipUrlSearch,
    loaderDeps: ({ search }) => adminPartnershipFiltersOf(fromAdminPartnershipUrlSearch(search)),
    // The backend enforces admin authorization; prefetch failures fall back to the client query.
    loader: ({ context: { queryClient }, params: { lng }, deps }) =>
        queryClient.prefetchInfiniteQuery(
            adminPartnershipListQueryOptions(
                deps,
                createAdminPartnershipErrorFactory(i18n.getFixedT(lng)),
            ),
        ),
    component: AdminPartnershipsRoute,
});

function AdminPartnershipsRoute() {
    const search = fromAdminPartnershipUrlSearch(Route.useSearch());
    const navigate = Route.useNavigate();
    return (
        <AdminPartnershipsPage
            search={search}
            onSearchChange={(next) =>
                navigate({ search: toAdminPartnershipUrlSearch(next), replace: true })
            }
        />
    );
}
