import { createFileRoute } from "@tanstack/react-router";
import { AdminPartnerApplicationsSection } from "@/components/admin/AdminPartnerApplicationsSection.tsx";

export const Route = createFileRoute("/$lng/_auth/admin/partner-applications")({
    component: AdminPartnerApplicationsSection,
});
