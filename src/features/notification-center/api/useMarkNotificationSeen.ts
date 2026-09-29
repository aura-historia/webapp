import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateNotificationSeen } from "@/client";
import { toast } from "sonner";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";

import { commitNotificationMutation, getNotificationMutationViewer } from "./notificationCache.ts";

export function useMarkNotificationSeen() {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();

    return useMutation({
        onMutate: getNotificationMutationViewer,
        mutationFn: async (notificationId: string) => {
            const result = await updateNotificationSeen({
                path: { notificationId },
                body: { seen: true },
            });

            if (result.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(result.error)));
            }
        },
        onSuccess: (_, notificationId, viewerId) =>
            commitNotificationMutation(queryClient, [notificationId], "seen", viewerId),
        onError: (error) => {
            toast.error(error.message);
        },
    });
}
