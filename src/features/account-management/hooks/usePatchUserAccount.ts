import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { updateUserAccount } from "@/client";
import {
    mapToInternalUserAccount,
    mapToBackendUserAccountPatch,
    type UserAccountData,
    type UserAccountPatchData,
} from "@/data/internal/account/UserAccountData.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { toast } from "sonner";
import { USER_ACCOUNT_QUERY_KEY } from "@/features/account-management/api/accountQueryKeys.ts";
import { isViewerScopedQuery } from "@/features/authentication/lib/clearViewerScopedQueries.ts";
import { cancelRefetches, isFirstLoadInFlight } from "@/lib/query/cancelRefetches.ts";

export function useUpdateUserAccount(): UseMutationResult<
    UserAccountData,
    Error,
    UserAccountPatchData
> {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();

    return useMutation({
        mutationFn: async (patchData: UserAccountPatchData) => {
            const patchPayload = mapToBackendUserAccountPatch(patchData);

            const updateResponse = await updateUserAccount({ body: patchPayload });

            if (updateResponse.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(updateResponse.error)));
            }

            return mapToInternalUserAccount(updateResponse.data);
        },

        onSuccess: async (updatedData) => {
            const affectedQueries = {
                predicate: ({ queryKey }: { queryKey: readonly unknown[] }) =>
                    queryKey[0] !== USER_ACCOUNT_QUERY_KEY[0] && isViewerScopedQuery(queryKey),
            };
            await cancelRefetches(queryClient, affectedQueries);
            queryClient.setQueryData(USER_ACCOUNT_QUERY_KEY, updatedData);
            // Invalidation alone keeps previously visible content in the cache during refetch.
            // Resetting a first load would reject its route loader; `cancelRefetches` refetches it.
            await queryClient.resetQueries({
                predicate: (query) =>
                    !isFirstLoadInFlight(query) && affectedQueries.predicate(query),
            });
        },

        onError: (error) => {
            toast.error(error.message);
        },
    });
}
