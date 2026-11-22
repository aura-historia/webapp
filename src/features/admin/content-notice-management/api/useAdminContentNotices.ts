import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { adminGetContentNotice, adminSearchContentNotices } from "@/client";
import {
    type AdminContentNoticeFilters,
    type AdminContentNoticePage,
    mapToAdminContentNotice,
    mapToAdminContentNoticePage,
    mapToAdminContentNoticeSearchQuery,
} from "@/data/internal/content-notice/AdminContentNotice.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";

export const ADMIN_CONTENT_NOTICES_QUERY_KEY = ["admin", "content-notices"] as const;
export const adminContentNoticeListQueryKey = (filters: AdminContentNoticeFilters) =>
    [...ADMIN_CONTENT_NOTICES_QUERY_KEY, "list", filters] as const;
export const adminContentNoticeDetailQueryKey = (id?: string) =>
    [...ADMIN_CONTENT_NOTICES_QUERY_KEY, "detail", id] as const;

/** Notices hold the notifier's personal data: keep them only while a page shows them. */
const PERSONAL_DATA_GC_TIME = 60_000;

export class AdminContentNoticeRequestError extends Error {
    constructor(
        message: string,
        readonly status: number,
    ) {
        super(message);
    }
}

function useAdminContentNoticeError() {
    const { getErrorMessage } = useApiError();
    const { t } = useTranslation();
    return (error: Parameters<typeof mapToInternalApiError>[0], status?: number) => {
        const problem = mapToInternalApiError(error, status);
        let message: string;
        if (problem.status === 404) {
            message = t("adminContentNotices.errors.missing");
        } else if (problem.status === 400) {
            message = t("adminContentNotices.errors.filterRejected");
        } else {
            message = getErrorMessage(problem);
        }
        return new AdminContentNoticeRequestError(message, problem.status);
    };
}

export function useAdminContentNotices(filters: AdminContentNoticeFilters) {
    const requestError = useAdminContentNoticeError();
    return useInfiniteQuery({
        queryKey: adminContentNoticeListQueryKey(filters),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (page: AdminContentNoticePage) => page.searchAfter,
        staleTime: 30_000,
        gcTime: PERSONAL_DATA_GC_TIME,
        queryFn: async ({ pageParam, signal }) => {
            const response = await adminSearchContentNotices({
                query: mapToAdminContentNoticeSearchQuery(filters, pageParam),
                signal,
            });
            if (response.error || !response.data)
                throw requestError(response.error, response.response?.status);
            return mapToAdminContentNoticePage(response.data);
        },
    });
}

export function useAdminContentNotice(id?: string, enabled = true) {
    const requestError = useAdminContentNoticeError();
    return useQuery({
        queryKey: adminContentNoticeDetailQueryKey(id),
        enabled: enabled && Boolean(id),
        staleTime: 30_000,
        gcTime: PERSONAL_DATA_GC_TIME,
        // A missing notice stays missing; other failures get the usual retry.
        retry: (failureCount, error) =>
            !(error instanceof AdminContentNoticeRequestError && error.status === 404) &&
            failureCount < 2,
        queryFn: async ({ signal }) => {
            if (!id) throw new Error("Missing content notice ID");
            const response = await adminGetContentNotice({
                path: { contentNoticeId: id },
                signal,
            });
            if (response.error || !response.data)
                throw requestError(response.error, response.response?.status);
            return mapToAdminContentNotice(response.data);
        },
    });
}
