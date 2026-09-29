import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateNotificationsSeen } from "@/client";
import { toast } from "sonner";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { commitNotificationMutation } from "./notificationCache.ts";

/** Explicit selected-bulk operation; mark-all uses its dedicated endpoint. */
export function useMarkNotificationsSeen() {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();
    return useMutation({
        mutationFn: async (notificationIds: readonly string[]) => {
            if (notificationIds.length === 0) return;
            const result = await updateNotificationsSeen({
                body: { notificationIds: [...notificationIds], seen: true },
            });
            if (result.error) throw new Error(getErrorMessage(mapToInternalApiError(result.error)));
        },
        onSuccess: (_, ids) =>
            ids.length > 0 ? commitNotificationMutation(queryClient, ids, "seen") : undefined,
        onError: (error) => toast.error(error.message),
    });
}
