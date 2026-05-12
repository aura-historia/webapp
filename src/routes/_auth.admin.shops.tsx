import { createFileRoute } from "@tanstack/react-router";
import { AdminShopsSection } from "@/components/admin/AdminShopsSection.tsx";

export const Route = createFileRoute("/_auth/admin/shops")({
    component: AdminShopsSection,
});
