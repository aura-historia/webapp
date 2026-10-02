import { useQuery } from "@tanstack/react-query";
import { searchPublicListingSources } from "@/client";
import { mapToApplicationListingSource } from "@/data/internal/partner-application/OwnPartnershipApplication.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";

export function useApplicationListingSourceSearch(search: string, enabled = true) {
    const { getErrorMessage } = useApiError();
    const query = search.trim();
    return useQuery({
        queryKey: ["public-listing-source-selection", query],
        enabled: enabled && query.length > 0,
        staleTime: 30_000,
        queryFn: async () => {
            const response = await searchPublicListingSources({ query: { query, size: 10 } });
            if (response.error || !response.data)
                throw new Error(
                    getErrorMessage(
                        mapToInternalApiError(response.error, response.response?.status),
                    ),
                );
            return response.data.items.map(mapToApplicationListingSource);
        },
    });
}
