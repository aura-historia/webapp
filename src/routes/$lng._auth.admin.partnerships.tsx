import { createFileRoute } from "@tanstack/react-router";
import { AdminPartnershipsPage } from "@/features/admin/partnership-management/pages/AdminPartnershipsPage.tsx";

export const Route = createFileRoute("/$lng/_auth/admin/partnerships")({
    component: AdminPartnershipsPage,
});
