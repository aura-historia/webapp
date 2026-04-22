import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout.tsx";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";

export const Route = createFileRoute("/_auth/admin")({
    ssr: false,
    head: () =>
        generatePageHeadMeta({
            pageKey: "admin",
            noIndex: true,
        }),
    component: AdminRouteComponent,
});

function AdminRouteComponent() {
    return (
        <AdminLayout>
            <Outlet />
        </AdminLayout>
    );
}
