import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteNotifications } from "@/client";
import { toast } from "sonner";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";

export function useDeleteAllNotifications() {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();

    return useMutation({
        mutationFn: async () => {
            const result = await deleteNotifications();

            if (result.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(result.error)));
            }
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["getNotifications"] }),
        onError: (error) => {
            toast.error(error.message);
        },
    });
}
