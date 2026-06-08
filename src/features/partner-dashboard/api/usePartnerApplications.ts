import { useQuery } from "@tanstack/react-query";
import { getPartnerApplications } from "@/client";
import {
    mapToPartnerApplication,
    type PartnerApplication,
} from "@/data/internal/partner-application/PartnerApplication.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";

export function usePartnerApplications(enabled: boolean = true) {
    const { getErrorMessage } = useApiError();

    return useQuery<PartnerApplication[]>({
        queryKey: ["partner-dashboard", "partner-applications"],
        queryFn: async () => {
            const response = await getPartnerApplications();
            if (response.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(response.error)));
            }
            return response.data.map(mapToPartnerApplication);
        },
        enabled,
        staleTime: 30 * 1000,
    });
}
