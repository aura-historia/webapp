import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAllNotificationsSeen } from "@/client";
import { toast } from "sonner";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";

import { commitNotificationMutation, getNotificationMutationViewer } from "./notificationCache.ts";

export function useMarkAllNotificationsSeen() {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();

    return useMutation({
        onMutate: getNotificationMutationViewer,
        mutationFn: async () => {
            const result = await updateAllNotificationsSeen({ body: { seen: true } });

            if (result.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(result.error)));
            }
        },
        onSuccess: (_, _variables, viewerId) =>
            commitNotificationMutation(queryClient, undefined, "seen", viewerId),
        onError: (error) => {
            toast.error(error.message);
        },
    });
}
