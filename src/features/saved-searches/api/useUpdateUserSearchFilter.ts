import { updateUserSearchFilter } from "@/client";
import { toast } from "sonner";
import {
    mapToBackendPatchUserSearchFilter,
    mapToInternalUserSearchFilter,
    type UserSearchFilter,
    type UserSearchFilterPatchData,
} from "@/data/internal/search-filter/UserSearchFilter.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import {
    patchListingUserState,
    withSearchFilterName,
} from "@/features/product/catalog/lib/listingUserStateCache.ts";

type UpdateUserSearchFilterVariables = {
    id: string;
    patch: UserSearchFilterPatchData;
};

export function useUpdateUserSearchFilter(): UseMutationResult<
    UserSearchFilter,
    Error,
    UpdateUserSearchFilterVariables
> {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();

    return useMutation({
        mutationFn: async ({ id, patch }: UpdateUserSearchFilterVariables) => {
            const result = await updateUserSearchFilter({
                path: { userSearchFilterId: id },
                body: mapToBackendPatchUserSearchFilter(patch),
            });

            if (result.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(result.error)));
            }

            return mapToInternalUserSearchFilter(result.data);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["userSearchFilters"] });
            queryClient.invalidateQueries({ queryKey: ["userSearchFilter", data.id] });
            patchListingUserState(
                queryClient,
                "allListings",
                withSearchFilterName(data.id, data.name),
            );
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
}
