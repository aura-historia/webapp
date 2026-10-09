import { queryOptions, useQuery } from "@tanstack/react-query";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { getAdminOverview } from "@/client";
import {
    InvalidAdminOverviewError,
    mapToAdminOverview,
} from "@/data/internal/admin/AdminOverview.ts";

/** Shared key: admin mutations that change any aggregate invalidate this prefix. */
export const ADMIN_OVERVIEW_QUERY_KEY = ["admin", "overview"] as const;

export class AdminOverviewRequestError extends Error {
    constructor(
        message: string,
        readonly status: number,
    ) {
        super(message);
    }
}

type AdminOverviewErrorFactory = (status: number | undefined) => AdminOverviewRequestError;

export function createAdminOverviewErrorFactory(t: TFunction): AdminOverviewErrorFactory {
    return (status) => {
        const safeStatus = status ?? 500;
        let key: string;
        if (safeStatus === 401 || safeStatus === 403) {
            key = "adminOverview.errors.forbidden";
        } else if (safeStatus === 503) {
            key = "adminOverview.errors.unavailable";
        } else {
            key = "adminOverview.errors.requestFailed";
        }
        return new AdminOverviewRequestError(t(key), safeStatus);
    };
}

export function adminOverviewQueryOptions(requestError: AdminOverviewErrorFactory) {
    return queryOptions({
        queryKey: ADMIN_OVERVIEW_QUERY_KEY,
        staleTime: 30_000,
        queryFn: async ({ signal }) => {
            // The endpoint is private and no-store; never let a browser cache reuse counters.
            const response = await getAdminOverview({ signal, cache: "no-store" });
            if (response.error || !response.data) {
                throw requestError(response.response?.status);
            }
            try {
                return mapToAdminOverview(response.data);
            } catch (error) {
                if (error instanceof InvalidAdminOverviewError) throw requestError(500);
                throw error;
            }
        },
    });
}

export function useAdminOverview() {
    const { t } = useTranslation();
    return useQuery(adminOverviewQueryOptions(createAdminOverviewErrorFactory(t)));
}
