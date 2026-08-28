import { useNavigate, useSearch } from "@tanstack/react-router";
import { AdminUsersSection } from "@/features/admin/user-management/components/AdminUsersSection.tsx";

export function AdminUsersPage() {
    const { userId } = useSearch({ from: "/$lng/_auth/admin/users" });
    const navigate = useNavigate({ from: "/$lng/admin/users" });

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
