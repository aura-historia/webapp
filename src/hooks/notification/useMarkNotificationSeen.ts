import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchNotification } from "@/client";

export function useMarkNotificationSeen() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (eventId: string) => {
            const result = await patchNotification({
                path: { eventId },
                body: { seen: true },
            });

            if (result.error) {
                throw new Error("Failed to mark notification as seen");
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
    });
}
