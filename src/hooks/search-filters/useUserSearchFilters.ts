import { getUserSearchFilters } from "@/client";
import {
    mapToInternalUserSearchFilterCollection,
    type UserSearchFilterCollection,
} from "@/data/internal/search-filter/UserSearchFilterCollection.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";

export function useUserSearchFilters(): UseQueryResult<UserSearchFilterCollection> {
    const { getErrorMessage } = useApiError();

    return useQuery({
        queryKey: ["userSearchFilters"],
        queryFn: async () => {
            const result = await getUserSearchFilters({
                query: { sort: "created", order: "desc" },
            });

            if (result.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(result.error)));
            }

            return mapToInternalUserSearchFilterCollection(result.data);
        },
    });
}
