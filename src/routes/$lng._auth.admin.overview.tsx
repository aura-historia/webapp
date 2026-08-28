import { createFileRoute } from "@tanstack/react-router";
import { AdminOverviewPage } from "@/features/admin/overview/pages/AdminOverviewPage.tsx";

export const Route = createFileRoute("/$lng/_auth/admin/overview")({
    component: AdminOverviewPage,
});
