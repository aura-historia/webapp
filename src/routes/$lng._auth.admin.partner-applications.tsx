import { createFileRoute } from "@tanstack/react-router";
import { AdminPartnerApplicationsPage } from "@/features/admin/partner-application-management/pages/AdminPartnerApplicationsPage.tsx";

export const Route = createFileRoute("/$lng/_auth/admin/partner-applications")({
    component: AdminPartnerApplicationsPage,
});
