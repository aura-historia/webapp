import { useQuery } from "@tanstack/react-query";
import { getMyListingSources } from "@/client";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { mapToOwnListingSource } from "@/data/internal/listing-source/OwnListingSource.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";

export type { OwnListingSource } from "@/data/internal/listing-source/OwnListingSource.ts";

export const OWN_LISTING_SOURCES_QUERY_KEY = ["ownListingSources"] as const;

export function useOwnListingSources(enabled: boolean) {
    const { getErrorMessage } = useApiError();

    return useQuery({
        queryKey: OWN_LISTING_SOURCES_QUERY_KEY,
        queryFn: async ({ signal }) => {
            const response = await getMyListingSources({ cache: "no-store", signal });
            if (response.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(response.error)));
            }
            return response.data.map(mapToOwnListingSource);
        },
        enabled,
        retry: false,
        staleTime: 0,
        gcTime: 0,
    });
}
