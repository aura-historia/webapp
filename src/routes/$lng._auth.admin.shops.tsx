import { createFileRoute } from "@tanstack/react-router";
import { AdminShopsSection } from "@/features/admin/shop-management/components/AdminShopsSection.tsx";

export const Route = createFileRoute("/$lng/_auth/admin/shops")({
    component: AdminShopsSection,
});
