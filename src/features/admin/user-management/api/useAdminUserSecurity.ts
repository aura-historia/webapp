import { useCallback } from "react";
import { infiniteQueryOptions, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import {
    adminDeleteUserAccessToken,
    adminDeleteUserAccessTokens,
    adminListUserAccessTokens,
    adminRevokeUserSessions,
    adminSuspendUser,
    adminUnsuspendUser,
    type AdminAccessTokenCollectionData,
    type SuspendUserResponseData,
} from "@/client";
import {
    mapToAdminAccessToken,
    type AdminAccessToken,
} from "@/data/internal/admin/AdminAccessToken.ts";
import { AdminUserRequestError } from "./useAdminUsers.ts";

export const ADMIN_USER_ACCESS_TOKENS_PAGE_SIZE = 21;

export const adminUserAccessTokensQueryKey = (userId: string) =>
    ["admin", "users", "access-tokens", userId] as const;

export type AdminUserAccessTokensPage = {
    readonly items: AdminAccessToken[];
    readonly size: number;
    readonly searchAfter?: readonly [string, string];
};

type SecurityOperation = "suspend" | "unsuspend" | "sessions" | "listTokens" | "revokeTokens";

export function createAdminUserSecurityErrorFactory(t: TFunction) {
    return (status: number | undefined, operation: SecurityOperation) => {
        const safeStatus = status ?? 500;
        let key: string;

        if (safeStatus === 401 || safeStatus === 403) {
            key = "adminUsers.errors.forbidden";
        } else if (safeStatus === 404) {
            key = "adminUsers.errors.missing";
        } else if (safeStatus === 409 && operation === "suspend") {
            key = "adminUsers.errors.lastAdmin";
        } else if (safeStatus === 409) {
            key = "adminUsers.security.errors.conflict";
        } else if (safeStatus === 400) {
            key = "adminUsers.security.errors.invalid";
        } else {
            key = "adminUsers.errors.requestFailed";
        }

        // Do not expose backend details, which can include private account or credential data.
        return new AdminUserRequestError(t(key), safeStatus);
    };
}

type AdminUserSecurityErrorFactory = ReturnType<typeof createAdminUserSecurityErrorFactory>;

function serializeAdminAccessTokenCursor(
    cursor: readonly [string, string] | null | undefined,
): string | undefined {
    return cursor ? JSON.stringify(cursor) : undefined;
}

function mapAdminAccessTokenCollection(
    collection: AdminAccessTokenCollectionData,
    userId: string,
): AdminUserAccessTokensPage {
    const cursor = collection.searchAfter;
    return {
        items: collection.items.map((token) => mapToAdminAccessToken(token, userId)),
        size: collection.size,
        ...(cursor ? { searchAfter: [cursor[0], cursor[1]] as const } : {}),
    };
}

export function adminUserAccessTokensQueryOptions(
    userId: string,
    requestError: AdminUserSecurityErrorFactory,
) {
    return infiniteQueryOptions({
        queryKey: adminUserAccessTokensQueryKey(userId),
        enabled: Boolean(userId),
        initialPageParam: undefined as readonly [string, string] | undefined,
        getNextPageParam: (page: AdminUserAccessTokensPage) => page.searchAfter,
        staleTime: 0,
        gcTime: 0,
        queryFn: async ({ pageParam, signal }): Promise<AdminUserAccessTokensPage> => {
            const searchAfter = serializeAdminAccessTokenCursor(pageParam);
            const response = await adminListUserAccessTokens({
                path: { userId },
                query: {
                    size: ADMIN_USER_ACCESS_TOKENS_PAGE_SIZE,
                    ...(searchAfter && { searchAfter }),
                },
                signal,
                cache: "no-store",
            });

            if (response.error || !response.data) {
                throw requestError(response.response?.status, "listTokens");
            }

            try {
                return mapAdminAccessTokenCollection(response.data, userId);
            } catch {
                throw requestError(500, "listTokens");
            }
        },
    });
}

export function useAdminUserAccessTokens(userId: string) {
    const { t } = useTranslation();
    return useInfiniteQuery(
        adminUserAccessTokensQueryOptions(userId, createAdminUserSecurityErrorFactory(t)),
    );
}

type SuspendAdminUserInput = {
    readonly userId: string;
    readonly reason: string;
};

type RevokeAdminUserTokenInput = {
    readonly userId: string;
    readonly accessTokenId: string;
};

function requireResponseData<T>(
    response: {
        readonly data?: T;
        readonly error?: unknown;
        readonly response?: { status?: number };
    },
    requestError: AdminUserSecurityErrorFactory,
    operation: SecurityOperation,
): T {
    if (response.error || !response.data) {
        throw requestError(response.response?.status, operation);
    }
    return response.data;
}

function requireNoContentSuccess(
    response: { readonly error?: unknown; readonly response?: { status?: number } },
    requestError: AdminUserSecurityErrorFactory,
    operation: SecurityOperation,
): void {
    if (response.error || response.response?.status !== 204) {
        throw requestError(response.response?.status, operation);
    }
}

export function useAdminUserSecurityActions() {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const requestError = createAdminUserSecurityErrorFactory(t);

    const suspend = useCallback(
        async ({ userId, reason }: SuspendAdminUserInput): Promise<SuspendUserResponseData> => {
            const response = await adminSuspendUser({
                path: { userId },
                body: { reason },
                cache: "no-store",
            });
            const data = requireResponseData(response, requestError, "suspend");
            if (data.userId !== userId || data.suspended !== true) {
                throw requestError(500, "suspend");
            }
            return data;
        },
        [requestError],
    );

    const unsuspend = useCallback(
        async (userId: string) => {
            const response = await adminUnsuspendUser({ path: { userId }, cache: "no-store" });
            const data = requireResponseData(response, requestError, "unsuspend");
            if (data.userId !== userId || data.suspended !== false) {
                throw requestError(500, "unsuspend");
            }
            return data;
        },
        [requestError],
    );

    const revokeSessions = useCallback(
        async (userId: string) => {
            const response = await adminRevokeUserSessions({
                path: { userId },
                cache: "no-store",
            });
            requireNoContentSuccess(response, requestError, "sessions");
        },
        [requestError],
    );

    const revokeToken = useCallback(
        async ({ userId, accessTokenId }: RevokeAdminUserTokenInput) => {
            const response = await adminDeleteUserAccessToken({
                path: { userId, accessTokenId },
                cache: "no-store",
            });
            requireNoContentSuccess(response, requestError, "revokeTokens");
            await queryClient.invalidateQueries({
                queryKey: adminUserAccessTokensQueryKey(userId),
            });
        },
        [queryClient, requestError],
    );

    const revokeAllTokens = useCallback(
        async (userId: string) => {
            const response = await adminDeleteUserAccessTokens({
                path: { userId },
                cache: "no-store",
            });
            requireNoContentSuccess(response, requestError, "revokeTokens");
            await queryClient.invalidateQueries({
                queryKey: adminUserAccessTokensQueryKey(userId),
            });
        },
        [queryClient, requestError],
    );

    return { suspend, unsuspend, revokeSessions, revokeToken, revokeAllTokens };
}
