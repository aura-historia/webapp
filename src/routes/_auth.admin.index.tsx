import { createFileRoute } from "@tanstack/react-router";
import { AdminOverviewPage } from "@/components/admin/AdminOverviewPage.tsx";

export const Route = createFileRoute("/_auth/admin/")({
    component: AdminOverviewPage,
});
