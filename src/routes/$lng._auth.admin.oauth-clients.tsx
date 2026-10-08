import { createFileRoute } from "@tanstack/react-router";
import { AdminOAuthClientsPage } from "@/features/admin/oauth-client-management/pages/AdminOAuthClientsPage.tsx";

export const Route = createFileRoute("/$lng/_auth/admin/oauth-clients")({
    component: AdminOAuthClientsPage,
});
