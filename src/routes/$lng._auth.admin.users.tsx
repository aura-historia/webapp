import { createFileRoute } from "@tanstack/react-router";
import { AdminUsersPage } from "@/features/admin/user-management/pages/AdminUsersPage.tsx";

type AdminUsersSearch = {
    readonly userId?: string;
};

export const Route = createFileRoute("/$lng/_auth/admin/users")({
    validateSearch: (search: Record<string, unknown>): AdminUsersSearch => ({
        userId: typeof search.userId === "string" ? search.userId : undefined,
    }),
    component: AdminUsersPage,
});
