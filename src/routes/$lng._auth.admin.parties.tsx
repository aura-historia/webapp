import { createFileRoute } from "@tanstack/react-router";
import { AdminPartiesPage } from "@/features/admin/party-management/pages/AdminPartiesPage.tsx";

export const Route = createFileRoute("/$lng/_auth/admin/parties")({
    component: AdminPartiesPage,
});
