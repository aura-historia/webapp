import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateNotificationSeen } from "@/client";
import { toast } from "sonner";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";

export function useMarkNotificationSeen() {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();

    return useMutation({
        mutationFn: async (notificationId: string) => {
            const result = await updateNotificationSeen({
                path: { notificationId },
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
                queryClient.invalidateQueries({ queryKey: ["similarProductListings"] }),
                queryClient.invalidateQueries({ queryKey: ["getProductListing"] }),
                queryClient.invalidateQueries({ queryKey: ["getProductListingByTitleSlug"] }),
                queryClient.invalidateQueries({ queryKey: ["watchlist"] }),
                queryClient.invalidateQueries({ queryKey: ["getNotifications"] }),
            ]);
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
}
