import { createFileRoute } from "@tanstack/react-router";
import { AdminPartnershipApplicationsPage } from "@/features/admin/partner-application-management/pages/AdminPartnershipApplicationsPage.tsx";
import { validateAdminApplicationSearch } from "@/features/admin/partner-application-management/lib/adminApplicationSearch.ts";

export const Route = createFileRoute("/$lng/_auth/admin/partnership-applications")({
    validateSearch: validateAdminApplicationSearch,
    component: AdminPartnershipApplicationsRoute,
});

function AdminPartnershipApplicationsRoute() {
    const filters = Route.useSearch();
    const navigate = Route.useNavigate();
    return (
        <AdminPartnershipApplicationsPage
            filters={filters}
            onFiltersChange={(next) => navigate({ search: next, replace: true })}
        />
    );
}
