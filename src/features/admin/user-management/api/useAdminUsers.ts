import {
    infiniteQueryOptions,
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import {
    adminDeleteUser,
    adminGetUser,
    adminPatchUser,
    adminSearchUsers,
    type PatchAdminUserData,
} from "@/client";
import {
    mapToAdminUserAccount,
    mapToAdminUserSummary,
    type AdminUserAccount,
    type AdminUserProfilePatch,
} from "@/data/internal/admin/AdminUser.ts";
import { ADMIN_OVERVIEW_QUERY_KEY } from "@/features/admin/overview/api/useAdminOverview.ts";
import { type AdminUserFilters, mapToAdminUserSearchQuery } from "../lib/adminUserSearch.ts";

export const ADMIN_USERS_QUERY_KEY = ["admin", "users"] as const;
export const ADMIN_USER_PATCH_MUTATION_KEY = [...ADMIN_USERS_QUERY_KEY, "patch"] as const;
export const adminUserListQueryKey = (filters: AdminUserFilters) =>
    [...ADMIN_USERS_QUERY_KEY, "list", filters] as const;
export const adminUserDetailQueryKey = (userId?: string) =>
    [...ADMIN_USERS_QUERY_KEY, "detail", userId] as const;

export type AdminUserPage = {
    readonly items: ReturnType<typeof mapToAdminUserSummary>[];
    readonly size: number;
    readonly searchAfter?: string;
    readonly total?: number;
};

type AdminUserOperation = "search" | "detail" | "profile" | "role" | "tier" | "delete";

export class AdminUserRequestError extends Error {
    constructor(
        message: string,
        readonly status: number,
    ) {
        super(message);
        this.name = "AdminUserRequestError";
    }
}

export function createAdminUserErrorFactory(t: TFunction) {
    return (status: number | undefined, operation: AdminUserOperation) => {
        const safeStatus = status ?? 500;
        let key: string;
        if (safeStatus === 401 || safeStatus === 403) {
            key = "adminUsers.errors.forbidden";
        } else if (safeStatus === 404) {
            key = "adminUsers.errors.missing";
        } else if (safeStatus === 409 && operation === "role") {
            key = "adminUsers.errors.lastAdmin";
        } else if (safeStatus === 409 && operation === "delete") {
            key = "adminUsers.errors.deleteConflict";
        } else if (safeStatus === 409) {
            key = "adminUsers.errors.conflict";
        } else if (safeStatus === 400) {
            key = "adminUsers.errors.invalid";
        } else {
            key = "adminUsers.errors.requestFailed";
        }
        // API details can include account data; only show localized, status-based copy.
        return new AdminUserRequestError(t(key), safeStatus);
    };
}

function useAdminUserError() {
    const { t } = useTranslation();
    return createAdminUserErrorFactory(t);
}

type AdminUserErrorFactory = ReturnType<typeof createAdminUserErrorFactory>;

export function adminUserListQueryOptions(
    filters: AdminUserFilters,
    requestError: AdminUserErrorFactory,
) {
    return infiniteQueryOptions({
        queryKey: adminUserListQueryKey(filters),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (page: AdminUserPage) => page.searchAfter,
        // Short-lived so a loader prefetch survives until the page mounts without refetching.
        staleTime: 30_000,
        gcTime: 60_000,
        queryFn: async ({ pageParam, signal }): Promise<AdminUserPage> => {
            const response = await adminSearchUsers({
                query: mapToAdminUserSearchQuery(filters, pageParam),
                signal,
                cache: "no-store",
            });
            if (response.error || !response.data) {
                throw requestError(response.response?.status, "search");
            }
            return {
                items: response.data.items.map(mapToAdminUserSummary),
                size: response.data.size,
                ...(response.data.searchAfter !== undefined && {
                    searchAfter: response.data.searchAfter,
                }),
                ...(response.data.total !== undefined && { total: response.data.total }),
            };
        },
    });
}

export function useAdminUsers(filters: AdminUserFilters) {
    const requestError = useAdminUserError();
    return useInfiniteQuery(adminUserListQueryOptions(filters, requestError));
}

export function useAdminUser(userId?: string, enabled = true) {
    const requestError = useAdminUserError();
    return useQuery({
        queryKey: adminUserDetailQueryKey(userId),
        enabled: enabled && Boolean(userId),
        staleTime: 0,
        gcTime: 0,
        queryFn: async ({ signal }) => {
            if (!userId) throw new Error("Missing admin user ID");
            const response = await adminGetUser({
                path: { userId },
                signal,
                cache: "no-store",
            });
            if (response.error || !response.data) {
                throw requestError(response.response?.status, "detail");
            }
            return mapToAdminUserAccount(response.data);
        },
    });
}

type AdminUserMutationInput<Patch> = {
    readonly userId: string;
    readonly patch: Patch;
};

function useAdminUserMutationCache() {
    const queryClient = useQueryClient();

    return {
        onSuccess: async (account: AdminUserAccount) => {
            queryClient.setQueryData(adminUserDetailQueryKey(account.userId), account);
            void queryClient.invalidateQueries({ queryKey: ADMIN_OVERVIEW_QUERY_KEY });
            // Profile, role, and tier fields may affect active filters or sorting. Restart from page one.
            await queryClient.resetQueries({ queryKey: [...ADMIN_USERS_QUERY_KEY, "list"] });
        },
        onError: async (error: Error, { userId }: { readonly userId: string }) => {
            if (
                error instanceof AdminUserRequestError &&
                (error.status === 404 || error.status === 409)
            ) {
                await Promise.all([
                    queryClient.invalidateQueries({ queryKey: adminUserDetailQueryKey(userId) }),
                    queryClient.resetQueries({ queryKey: [...ADMIN_USERS_QUERY_KEY, "list"] }),
                ]);
            }
        },
    };
}

function useAdminUserPatchRequest(operation: "profile" | "role" | "tier") {
    const requestError = useAdminUserError();
    return async ({
        userId,
        patch,
    }: AdminUserMutationInput<PatchAdminUserData>): Promise<AdminUserAccount> => {
        const response = await adminPatchUser({
            path: { userId },
            body: patch,
            cache: "no-store",
        });
        if (response.error || !response.data) {
            throw requestError(response.response?.status, operation);
        }
        return mapToAdminUserAccount(response.data);
    };
}

export function useUpdateAdminUserProfile() {
    const request = useAdminUserPatchRequest("profile");
    return useMutation({
        mutationKey: ADMIN_USER_PATCH_MUTATION_KEY,
        mutationFn: (input: AdminUserMutationInput<AdminUserProfilePatch>) => request(input),
        ...useAdminUserMutationCache(),
    });
}

export function useUpdateAdminUserRole() {
    const request = useAdminUserPatchRequest("role");
    return useMutation({
        mutationKey: ADMIN_USER_PATCH_MUTATION_KEY,
        mutationFn: (input: AdminUserMutationInput<Pick<PatchAdminUserData, "role">>) =>
            request(input),
        ...useAdminUserMutationCache(),
    });
}

export function useUpdateAdminUserTier() {
    const request = useAdminUserPatchRequest("tier");
    return useMutation({
        mutationKey: ADMIN_USER_PATCH_MUTATION_KEY,
        mutationFn: (input: AdminUserMutationInput<Pick<PatchAdminUserData, "tier">>) =>
            request(input),
        ...useAdminUserMutationCache(),
    });
}

export function useDeleteAdminUser() {
    const requestError = useAdminUserError();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (userId: string) => {
            const response = await adminDeleteUser({
                path: { userId },
                cache: "no-store",
            });
            if (response.error) {
                throw requestError(response.response?.status, "delete");
            }
            return userId;
        },
        onSuccess: async (userId) => {
            queryClient.removeQueries({ queryKey: adminUserDetailQueryKey(userId) });
            void queryClient.invalidateQueries({ queryKey: ADMIN_OVERVIEW_QUERY_KEY });
            await queryClient.resetQueries({ queryKey: [...ADMIN_USERS_QUERY_KEY, "list"] });
        },
        onError: async (error, userId) => {
            if (
                error instanceof AdminUserRequestError &&
                (error.status === 404 || error.status === 409)
            ) {
                await Promise.all([
                    queryClient.invalidateQueries({ queryKey: adminUserDetailQueryKey(userId) }),
                    queryClient.resetQueries({ queryKey: [...ADMIN_USERS_QUERY_KEY, "list"] }),
                ]);
            }
        },
    });
}
