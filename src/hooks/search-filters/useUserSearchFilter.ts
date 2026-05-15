import { getUserSearchFilter } from "@/client";
import {
    mapToInternalUserSearchFilter,
    type UserSearchFilter,
} from "@/data/internal/search-filter/UserSearchFilter.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";

export function useUserSearchFilter(id: string): UseQueryResult<UserSearchFilter> {
    const { getErrorMessage } = useApiError();

    return useQuery({
        queryKey: ["userSearchFilter", id],
        queryFn: async () => {
            const result = await getUserSearchFilter({
                path: { userSearchFilterId: id },
            });

            if (result.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(result.error)));
            }

            return mapToInternalUserSearchFilter(result.data);
        },
        enabled: !!id,
    });
}
