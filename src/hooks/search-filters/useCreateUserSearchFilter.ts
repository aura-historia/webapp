import { createUserSearchFilter } from "@/client";
import {
    mapToBackendCreateUserSearchFilter,
    mapToInternalUserSearchFilter,
    type UserSearchFilter,
    type UserSearchFilterCreateData,
} from "@/data/internal/search-filter/UserSearchFilter.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";

export function useCreateUserSearchFilter(): UseMutationResult<
    UserSearchFilter,
    Error,
    UserSearchFilterCreateData
> {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();

    return useMutation({
        mutationFn: async (data: UserSearchFilterCreateData) => {
            const result = await createUserSearchFilter({
                body: mapToBackendCreateUserSearchFilter(data),
            });

            if (result.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(result.error)));
            }

            return mapToInternalUserSearchFilter(result.data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["userSearchFilters"] });
        },
    });
}
