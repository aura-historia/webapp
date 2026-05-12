import { createFileRoute } from "@tanstack/react-router";
import { AdminPartnerApplicationsSection } from "@/components/admin/AdminPartnerApplicationsSection.tsx";

export const Route = createFileRoute("/_auth/admin/partner-applications")({
    component: AdminPartnerApplicationsSection,
});
