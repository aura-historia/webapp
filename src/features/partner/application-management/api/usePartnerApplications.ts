import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    deleteOwnPartnershipApplication,
    getOwnPartnershipApplication,
    getMyPartnershipApplications,
    postPartnershipApplication,
} from "@/client";
import {
    mapToPartnerApplication,
    mapToSubmitApplication,
    type PartnerApplication,
    type PartnershipProposal,
} from "@/data/internal/partner-application/OwnPartnershipApplication.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { useTranslation } from "react-i18next";

export const PARTNER_APPLICATIONS_QUERY_KEY = ["own-partnership-applications"] as const;
export const partnerApplicationDetailQueryKey = (id?: string) =>
    [...PARTNER_APPLICATIONS_QUERY_KEY, "detail", id] as const;
export class ApplicationRequestError extends Error {
    constructor(
        message: string,
        readonly status: number,
    ) {
        super(message);
    }
}
function useApplicationError() {
    const { getErrorMessage } = useApiError();
    const { t } = useTranslation();
    return (error: Parameters<typeof mapToInternalApiError>[0], status?: number) => {
        const problem = mapToInternalApiError(error, status);
        const message =
            problem.status === 409
                ? t("partnerApplications.proposals.conflict")
                : problem.status === 404
                  ? t("partnerApplications.proposals.missing")
                  : getErrorMessage(problem);
        return new ApplicationRequestError(message, problem.status);
    };
}
export function usePartnerApplications(enabled = true) {
    const requestError = useApplicationError();
    return useQuery({
        queryKey: PARTNER_APPLICATIONS_QUERY_KEY,
        enabled,
        staleTime: 30_000,
        queryFn: async () => {
            const response = await getMyPartnershipApplications();
            if (response.error || !response.data)
                throw requestError(response.error, response.response?.status);
            return response.data.map(mapToPartnerApplication);
        },
    });
}
export function usePartnerApplicationDetails(id?: string, enabled = true) {
    const requestError = useApplicationError();
    return useQuery({
        queryKey: partnerApplicationDetailQueryKey(id),
        enabled: enabled && Boolean(id),
        staleTime: 30_000,
        queryFn: async () => {
            if (!id) throw new Error("Missing application ID");
            const response = await getOwnPartnershipApplication({
                path: { partnershipApplicationId: id },
            });
            if (response.error || !response.data)
                throw requestError(response.error, response.response?.status);
            return mapToPartnerApplication(response.data);
        },
    });
}
export function useCreatePartnerApplication() {
    const queryClient = useQueryClient();
    const requestError = useApplicationError();
    return useMutation({
        mutationFn: async (proposal: PartnershipProposal) => {
            const response = await postPartnershipApplication({
                body: mapToSubmitApplication(proposal),
            });
            if (response.error || !response.data)
                throw requestError(response.error, response.response?.status);
            return mapToPartnerApplication(response.data);
        },
        onSuccess: (application) => {
            queryClient.setQueryData<PartnerApplication[]>(
                PARTNER_APPLICATIONS_QUERY_KEY,
                (current) => [
                    application,
                    ...(current ?? []).filter((item) => item.id !== application.id),
                ],
            );
            queryClient.setQueryData(partnerApplicationDetailQueryKey(application.id), application);
            void queryClient.invalidateQueries({ queryKey: PARTNER_APPLICATIONS_QUERY_KEY });
        },
    });
}
export function useWithdrawPartnerApplication() {
    const queryClient = useQueryClient();
    const requestError = useApplicationError();
    return useMutation({
        mutationFn: async (id: string) => {
            const response = await deleteOwnPartnershipApplication({
                path: { partnershipApplicationId: id },
            });
            if (response.error || response.response?.status !== 204)
                throw requestError(response.error, response.response?.status);
        },
        onSuccess: (_result, id) => {
            const withdraw = (application: PartnerApplication): PartnerApplication =>
                application.id === id ? { ...application, state: "WITHDRAWN" } : application;
            queryClient.setQueryData<PartnerApplication[]>(
                PARTNER_APPLICATIONS_QUERY_KEY,
                (current) => current?.map(withdraw),
            );
            queryClient.setQueryData<PartnerApplication>(
                partnerApplicationDetailQueryKey(id),
                (current) => (current ? withdraw(current) : current),
            );
            void queryClient.invalidateQueries({ queryKey: PARTNER_APPLICATIONS_QUERY_KEY });
        },
        onError: () => {
            void queryClient.invalidateQueries({ queryKey: PARTNER_APPLICATIONS_QUERY_KEY });
        },
    });
}
