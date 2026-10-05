import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminGuard } from "@/features/admin/common/components/AdminGuard.tsx";
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
    // Temporarily suspend the dashboard shell while keeping admin access guarded.
    return (
        <AdminGuard>
            <Outlet />
        </AdminGuard>
    );
}
