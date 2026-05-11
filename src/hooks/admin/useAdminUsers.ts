import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { adminDeleteUser, adminGetUser, adminPatchUser, adminSearchUsers } from "@/client";
import type { SortUserFieldData, UserRoleData, UserTierData } from "@/client";
import {
    mapToAdminUser,
    mapToAdminUserPatch,
    type AdminUser,
    type AdminUserPatch,
} from "@/data/internal/admin/AdminUser.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { toast } from "sonner";

const PAGE_SIZE = 25;

export type AdminUserFilters = {
    readonly query?: string;
    readonly email?: string;
    readonly firstName?: string;
    readonly lastName?: string;
    readonly tier?: UserTierData[];
    readonly role?: UserRoleData[];
    readonly sort?: SortUserFieldData;
    readonly order?: "asc" | "desc";
};

export type AdminUserPage = {
    readonly items: AdminUser[];
    readonly searchAfter?: unknown[];
    readonly total?: number;
};

function replaceUpdatedUserInPages(
    old: InfiniteData<AdminUserPage> | undefined,
    updatedUser: AdminUser,
): InfiniteData<AdminUserPage> | undefined {
    if (!old || !("pages" in old) || !Array.isArray(old.pages)) return old;

    const pages = old.pages.map((page) => {
        const items = page.items.map((item) =>
            item.userId === updatedUser.userId ? updatedUser : item,
        );
        return {
            ...page,
            items,
        };
    });

    return {
        ...old,
        pageParams: old.pageParams,
        pages,
    };
}

/**
 * Remove the deleted user from an InfiniteData<AdminUserPage> structure.
 * Extracted to avoid deep nesting inside mutation callbacks.
 */
function removeDeletedUserFromPages(
    old: InfiniteData<AdminUserPage> | undefined,
    deletedUserId: string,
): InfiniteData<AdminUserPage> | undefined {
    if (!old || !("pages" in old) || !Array.isArray(old.pages)) return old;

    const pages = old.pages.map((page) => ({
        ...page,
        items: page.items.filter((item) => item.userId !== deletedUserId),
        total: page.total === undefined ? undefined : Math.max(0, page.total - 1),
    }));

    return {
        ...old,
        pageParams: old.pageParams,
        pages,
    };
}

export function useAdminUsers(filters: AdminUserFilters) {
    const { getErrorMessage } = useApiError();

    return useInfiniteQuery({
        queryKey: ["admin", "users", filters],
        queryFn: async ({ pageParam }): Promise<AdminUserPage> => {
            const response = await adminSearchUsers({
                query: {
                    query: filters.query || undefined,
                    email: filters.email || undefined,
                    firstName: filters.firstName || undefined,
                    lastName: filters.lastName || undefined,
                    tier: filters.tier,
                    role: filters.role,
                    sort: filters.sort,
                    order: filters.order,
                    size: PAGE_SIZE,
                    searchAfter: pageParam,
                },
            });

            if (response.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(response.error)));
            }

            return {
                items: response.data.items.map(mapToAdminUser),
                searchAfter: response.data.searchAfter ?? undefined,
                total: response.data.total ?? undefined,
            };
        },
        initialPageParam: undefined as unknown[] | undefined,
        getNextPageParam: (lastPage) => lastPage.searchAfter ?? undefined,
        staleTime: 30 * 1000,
    });
}

export function useAdminUser(userId?: string, enabled = true) {
    const { getErrorMessage } = useApiError();

    return useQuery({
        queryKey: ["admin", "users", "detail", userId],
        queryFn: async (): Promise<AdminUser> => {
            if (!userId) {
                throw new Error("Missing user id");
            }

            const response = await adminGetUser({ path: { userId } });
            if (response.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(response.error)));
            }
            return mapToAdminUser(response.data);
        },
        enabled: enabled && Boolean(userId),
        staleTime: 30 * 1000,
    });
}

export function usePatchAdminUser() {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();

    return useMutation<AdminUser, Error, AdminUserPatch>({
        mutationFn: async ({ userId, ...patch }) => {
            const response = await adminPatchUser({
                path: { userId },
                body: mapToAdminUserPatch(patch),
            });

            if (response.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(response.error)));
            }

            return mapToAdminUser(response.data);
        },
        onSuccess: (updatedUser) => {
            queryClient.setQueryData(["admin", "users", "detail", updatedUser.userId], updatedUser);
            queryClient.setQueriesData<InfiniteData<AdminUserPage>>(
                { queryKey: ["admin", "users"] },
                (old) => replaceUpdatedUserInPages(old, updatedUser),
            );
            queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
        },
        onError: (error) => {
            console.error("[usePatchAdminUser]", error);
            toast.error(error.message);
        },
    });
}

export function useDeleteAdminUser() {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();

    return useMutation<void, Error, string>({
        mutationFn: async (userId) => {
            const response = await adminDeleteUser({ path: { userId } });
            if (response.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(response.error)));
            }
        },
        onSuccess: (_, deletedUserId) => {
            queryClient.removeQueries({ queryKey: ["admin", "users", "detail", deletedUserId] });
            queryClient.setQueriesData<InfiniteData<AdminUserPage>>(
                { queryKey: ["admin", "users"] },
                (old) => removeDeletedUserFromPages(old, deletedUserId),
            );
            queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
        },
        onError: (error) => {
            console.error("[useDeleteAdminUser]", error);
            toast.error(error.message);
        },
    });
}
