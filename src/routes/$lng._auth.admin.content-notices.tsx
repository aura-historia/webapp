import { createFileRoute } from "@tanstack/react-router";
import { validateAdminContentNoticeSearch } from "@/features/admin/content-notice-management/lib/adminContentNoticeSearch.ts";
import { AdminContentNoticesPage } from "@/features/admin/content-notice-management/pages/AdminContentNoticesPage.tsx";

export const Route = createFileRoute("/$lng/_auth/admin/content-notices")({
    validateSearch: validateAdminContentNoticeSearch,
    component: AdminContentNoticesRoute,
});

function AdminContentNoticesRoute() {
    const search = Route.useSearch();
    const navigate = Route.useNavigate();
    const { lng } = Route.useParams();
    return (
        <AdminContentNoticesPage
            search={search}
            language={lng}
            onSearchChange={(next) => navigate({ search: next, replace: true })}
        />
    );
}
