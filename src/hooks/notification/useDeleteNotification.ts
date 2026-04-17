import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteNotification } from "@/client";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";

export function useDeleteNotification() {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();

    return useMutation({
        mutationFn: async (eventId: string) => {
            const result = await deleteNotification({ path: { eventId } });

            if (result.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(result.error)));
            }
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["getNotifications"] }),
    });
}
