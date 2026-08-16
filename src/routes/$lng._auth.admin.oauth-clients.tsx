import { createFileRoute } from "@tanstack/react-router";
import { AdminOAuthClientsSection } from "@/features/admin/oauth-client-management/components/AdminOAuthClientsSection.tsx";

export const Route = createFileRoute("/$lng/_auth/admin/oauth-clients")({
    component: AdminOAuthClientsSection,
});
