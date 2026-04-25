import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { deleteUser } from "@/client";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";

export function useDeleteUserAccount(): UseMutationResult<void, Error, void> {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();

    return useMutation({
        mutationFn: async () => {
            const result = await deleteUser();

            if (result.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(result.error)));
            }
        },
        onSuccess: () => {
            queryClient.clear();
        },
        onError: (error) => {
            console.error("[useDeleteUserAccount]", error);
        },
    });
}
