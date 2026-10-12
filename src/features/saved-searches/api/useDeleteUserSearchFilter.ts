import { deleteUserSearchFilter } from "@/client";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { productListingQueryKeys } from "@/data/internal/product/ProductListingQueryKeys.ts";
import {
    invalidateListingQueries,
    patchListingUserState,
    withoutSearchFilterMatch,
} from "@/features/product/catalog/lib/listingUserStateCache.ts";

export function useDeleteUserSearchFilter(): UseMutationResult<void, Error, string> {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();

    return useMutation({
        mutationFn: async (id: string) => {
            const result = await deleteUserSearchFilter({
                path: { userSearchFilterId: id },
            });

            if (result.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(result.error)));
            }
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ["userSearchFilters"] });
            queryClient.removeQueries({ queryKey: ["userSearchFilter", id] });
            queryClient.removeQueries({ queryKey: productListingQueryKeys.savedSearchMatches(id) });
            patchListingUserState(queryClient, "allListings", withoutSearchFilterMatch(id));
            invalidateListingQueries(queryClient);
        },
    });
}
