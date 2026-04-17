import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAllNotifications } from "@/client";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";

export function useDeleteAllNotifications() {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();

    return useMutation({
        mutationFn: async () => {
            const result = await deleteAllNotifications();

            if (result.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(result.error)));
            }
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["getNotifications"] }),
    });
}
