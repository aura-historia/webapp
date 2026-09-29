import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteNotification } from "@/client";
import { toast } from "sonner";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";

import { commitNotificationMutation, getNotificationMutationViewer } from "./notificationCache.ts";

export function useDeleteNotification() {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();

    return useMutation({
        onMutate: getNotificationMutationViewer,
        mutationFn: async (notificationId: string) => {
            const result = await deleteNotification({ path: { notificationId } });

            if (result.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(result.error)));
            }
        },
        onSuccess: (_, notificationId, viewerId) =>
            commitNotificationMutation(queryClient, [notificationId], "delete", viewerId),
        onError: (error) => {
            toast.error(error.message);
        },
    });
}
