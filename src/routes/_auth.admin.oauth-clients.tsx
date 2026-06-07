import { createFileRoute } from "@tanstack/react-router";
import { AdminOAuthClientsSection } from "@/components/admin/AdminOAuthClientsSection.tsx";

export const Route = createFileRoute("/_auth/admin/oauth-clients")({
    ssr: false,
    component: AdminOAuthClientsSection,
});
