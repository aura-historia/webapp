import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminGuard } from "@/features/admin/common/components/AdminGuard.tsx";
import { AdminLayout } from "@/features/admin/common/components/AdminLayout.tsx";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";

export const Route = createFileRoute("/$lng/_auth/admin")({
    ssr: "data-only",
    head: () =>
        generatePageHeadMeta({
            pageKey: "admin",
            noIndex: true,
        }),
    component: AdminRouteComponent,
});

function AdminRouteComponent() {
    // The shell renders only after the guard confirms the ADMIN role.
    return (
        <AdminGuard>
            <AdminLayout>
                <Outlet />
            </AdminLayout>
        </AdminGuard>
    );
}
