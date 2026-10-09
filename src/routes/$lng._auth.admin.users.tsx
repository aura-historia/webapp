import { createFileRoute } from "@tanstack/react-router";
import i18n from "@/i18n/i18n.ts";
import {
    adminUserListQueryOptions,
    createAdminUserErrorFactory,
} from "@/features/admin/user-management/api/useAdminUsers.ts";
import { AdminUsersPage } from "@/features/admin/user-management/pages/AdminUsersPage.tsx";
import {
    validateAdminUserSearch,
    withoutAdminUserSelection,
} from "@/features/admin/user-management/lib/adminUserSearch.ts";

export const Route = createFileRoute("/$lng/_auth/admin/users")({
    validateSearch: validateAdminUserSearch,
    loaderDeps: ({ search }) => withoutAdminUserSelection(search),
    // The backend enforces admin authorization; prefetch failures fall back to the client query.
    loader: ({ context: { queryClient }, deps, params: { lng } }) =>
        queryClient.prefetchInfiniteQuery(
            adminUserListQueryOptions(deps, createAdminUserErrorFactory(i18n.getFixedT(lng))),
        ),
    component: AdminUsersRoute,
});

function AdminUsersRoute() {
    const search = Route.useSearch();
    const navigate = Route.useNavigate();

    return (
        <AdminUsersPage
            filters={withoutAdminUserSelection(search)}
            selectedUserId={search.userId}
            onFiltersChange={(filters) =>
                navigate({
                    search: (previous) => ({ ...filters, userId: previous.userId }),
                    replace: true,
                })
            }
            onUserSelect={(userId) =>
                navigate({
                    search: (previous) => ({ ...previous, userId }),
                    replace: true,
                })
            }
            onDetailOpenChange={(open) => {
                if (!open) {
                    navigate({
                        search: (previous) => ({ ...previous, userId: undefined }),
                        replace: true,
                    });
                }
            }}
        />
    );
}
