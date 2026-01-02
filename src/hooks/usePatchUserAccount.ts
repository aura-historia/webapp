import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { updateUserAccount } from "@/client";
import {
    mapToInternalUserAccount,
    mapToBackendUserAccountPatch,
    type UserAccountData,
    type UserAccountPatchData,
} from "@/data/internal/UserAccountData";
import { useApiError } from "@/hooks/useApiError";
import { mapToInternalApiError } from "@/data/internal/ApiError";
import { toast } from "sonner";

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

        onSuccess: (updatedData) => {
            queryClient.setQueryData(["userAccount"], updatedData);
        },

        onError: (error) => {
            console.error("[useUpdateUserAccount]", error);
            toast.error(error.message);
        },
    });
}
