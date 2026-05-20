import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
const ADMIN_QUERY_OPTIONS = {
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always" as const,
    refetchOnReconnect: "always" as const,
    refetchOnWindowFocus: "always" as const,
};

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
        ...ADMIN_QUERY_OPTIONS,
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
        ...ADMIN_QUERY_OPTIONS,
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
        onSuccess: () => {
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
        },
        onError: (error) => {
            console.error("[useDeleteAdminUser]", error);
            toast.error(error.message);
        },
    });
}
