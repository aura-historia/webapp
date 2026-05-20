import { useQuery } from "@tanstack/react-query";
import { adminGetPartnerApplications } from "@/client";
import {
    mapToPartnerApplication,
    type PartnerApplication,
} from "@/data/internal/partner-application/PartnerApplication.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";

const ADMIN_QUERY_OPTIONS = {
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always" as const,
    refetchOnReconnect: "always" as const,
    refetchOnWindowFocus: "always" as const,
};

export function useAdminPartnerApplications(enabled: boolean = true) {
    const { getErrorMessage } = useApiError();

    return useQuery<PartnerApplication[]>({
        queryKey: ["admin", "partner-applications"],
        queryFn: async () => {
            const response = await adminGetPartnerApplications();
            if (response.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(response.error)));
            }
            return response.data.map(mapToPartnerApplication);
        },
        enabled,
        ...ADMIN_QUERY_OPTIONS,
    });
}
