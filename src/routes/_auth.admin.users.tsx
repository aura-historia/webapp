import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AdminUsersSection } from "@/components/admin/AdminUsersSection.tsx";

type AdminUsersSearch = {
    readonly userId?: string;
};

export const Route = createFileRoute("/_auth/admin/users")({
    validateSearch: (search: Record<string, unknown>): AdminUsersSearch => ({
        userId: typeof search.userId === "string" ? search.userId : undefined,
    }),
    component: AdminUsersRouteComponent,
});

function AdminUsersRouteComponent() {
    const { userId } = Route.useSearch();
    const navigate = useNavigate({ from: "/admin/users" });

    return (
        <AdminUsersSection
            selectedUserId={userId}
            onSelectedUserIdChange={(nextUserId) =>
                navigate({
                    search: nextUserId ? { userId: nextUserId } : {},
                    replace: true,
                })
            }
        />
    );
}
