import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
    adminDecidePartnershipApplication,
    adminGetPartnershipApplication,
    adminMarkPartnershipApplicationInReview,
    adminSearchPartnershipApplications,
} from "@/client";
import {
    type AdminApplicationDecision,
    type AdminApplicationFilters,
    type AdminPartnershipApplication,
    type AdminPartnershipApplicationPage,
    mapToAdminApplicationSearchQuery,
    mapToAdminPartnershipApplication,
    mapToAdminPartnershipApplicationPage,
} from "@/data/internal/partner-application/AdminPartnershipApplication.ts";
import { ADMIN_OVERVIEW_QUERY_KEY } from "@/features/admin/overview/api/useAdminOverview.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";

export const ADMIN_APPLICATIONS_QUERY_KEY = ["admin", "partnership-applications"] as const;
export const adminApplicationListQueryKey = (filters: AdminApplicationFilters) =>
    [...ADMIN_APPLICATIONS_QUERY_KEY, "list", filters] as const;
export const adminApplicationDetailQueryKey = (id?: string) =>
    [...ADMIN_APPLICATIONS_QUERY_KEY, "detail", id] as const;
/** Caches whose contents an application transition can change. */
export const ADMIN_APPLICATION_DEPENDENT_QUERY_KEYS = [
    ADMIN_OVERVIEW_QUERY_KEY,
    ["admin", "partnerships"],
    ["admin", "listing-sources"],
] as const;

export class AdminApplicationRequestError extends Error {
    constructor(
        message: string,
        readonly status: number,
    ) {
        super(message);
    }
}

function useAdminApplicationError() {
    const { getErrorMessage } = useApiError();
    const { t } = useTranslation();
    return (error: Parameters<typeof mapToInternalApiError>[0], status?: number) => {
        const problem = mapToInternalApiError(error, status);
        let message: string;
        if (problem.status === 409) {
            message = t("adminApplications.errors.conflict");
        } else if (problem.status === 404) {
            message = t("adminApplications.errors.missing");
        } else {
            message = getErrorMessage(problem);
        }
        return new AdminApplicationRequestError(message, problem.status);
    };
}

export function useAdminPartnershipApplications(filters: AdminApplicationFilters) {
    const requestError = useAdminApplicationError();
    return useInfiniteQuery({
        queryKey: adminApplicationListQueryKey(filters),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (page: AdminPartnershipApplicationPage) => page.searchAfter,
        staleTime: 30_000,
        queryFn: async ({ pageParam, signal }) => {
            const response = await adminSearchPartnershipApplications({
                query: mapToAdminApplicationSearchQuery(filters, pageParam),
                signal,
            });
            if (response.error || !response.data)
                throw requestError(response.error, response.response?.status);
            return mapToAdminPartnershipApplicationPage(response.data);
        },
    });
}

export function useAdminPartnershipApplication(id?: string, enabled = true) {
    const requestError = useAdminApplicationError();
    return useQuery({
        queryKey: adminApplicationDetailQueryKey(id),
        enabled: enabled && Boolean(id),
        staleTime: 30_000,
        queryFn: async ({ signal }) => {
            if (!id) throw new Error("Missing application ID");
            const response = await adminGetPartnershipApplication({
                path: { partnershipApplicationId: id },
                signal,
            });
            if (response.error || !response.data)
                throw requestError(response.error, response.response?.status);
            return mapToAdminPartnershipApplication(response.data);
        },
    });
}

function useApplicationTransitionCache() {
    const queryClient = useQueryClient();
    const refreshAuthoritativeState = (id: string) => {
        void queryClient.invalidateQueries({ queryKey: adminApplicationDetailQueryKey(id) });
        void queryClient.invalidateQueries({
            queryKey: [...ADMIN_APPLICATIONS_QUERY_KEY, "list"],
        });
    };
    return {
        onSuccess: (application: AdminPartnershipApplication) => {
            queryClient.setQueryData(adminApplicationDetailQueryKey(application.id), application);
            void queryClient.invalidateQueries({
                queryKey: [...ADMIN_APPLICATIONS_QUERY_KEY, "list"],
            });
            for (const queryKey of ADMIN_APPLICATION_DEPENDENT_QUERY_KEYS) {
                void queryClient.invalidateQueries({ queryKey });
            }
        },
        // A conflict means another reviewer moved the application; never assume our transition.
        onError: (_error: Error, id: string) => refreshAuthoritativeState(id),
    };
}

/** Performs the body-less SUBMITTED → IN_REVIEW transition; no state or proposal is sent. */
export function useMarkAdminApplicationInReview() {
    const requestError = useAdminApplicationError();
    const cache = useApplicationTransitionCache();
    return useMutation({
        mutationFn: async (id: string) => {
            const response = await adminMarkPartnershipApplicationInReview({
                path: { partnershipApplicationId: id },
            });
            if (response.error || !response.data)
                throw requestError(response.error, response.response?.status);
            return mapToAdminPartnershipApplication(response.data);
        },
        onSuccess: cache.onSuccess,
        onError: (error, id) => cache.onError(error, id),
    });
}

export type AdminApplicationDecisionInput = {
    readonly id: string;
    readonly decision: AdminApplicationDecision;
};

export function useDecideAdminApplication() {
    const requestError = useAdminApplicationError();
    const cache = useApplicationTransitionCache();
    return useMutation({
        mutationFn: async ({ id, decision }: AdminApplicationDecisionInput) => {
            const response = await adminDecidePartnershipApplication({
                path: { partnershipApplicationId: id },
                body: { decision },
            });
            if (response.error || !response.data)
                throw requestError(response.error, response.response?.status);
            return mapToAdminPartnershipApplication(response.data);
        },
        onSuccess: cache.onSuccess,
        onError: (error, { id }) => cache.onError(error, id),
    });
}
