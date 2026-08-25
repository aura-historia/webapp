import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchNotification } from "@/client";
import { toast } from "sonner";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";

export function useMarkNotificationSeen() {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();

    return useMutation({
        mutationFn: async (eventId: string) => {
            const result = await patchNotification({
                path: { eventId },
                body: { seen: true },
            });

            if (result.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(result.error)));
            }

            return result.data;
        },
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["search"] }),
                queryClient.invalidateQueries({ queryKey: ["getSimilarProducts"] }),
                queryClient.invalidateQueries({ queryKey: ["getProduct"] }),
                queryClient.invalidateQueries({ queryKey: ["getProductBySlug"] }),
                queryClient.invalidateQueries({ queryKey: ["watchlist"] }),
                queryClient.invalidateQueries({ queryKey: ["getNotifications"] }),
            ]);
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
}
