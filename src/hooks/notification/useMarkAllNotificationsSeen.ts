import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchAllNotifications } from "@/client";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";

export function useMarkAllNotificationsSeen() {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();

    return useMutation({
        mutationFn: async () => {
            const result = await patchAllNotifications({ body: { seen: true } });

            if (result.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(result.error)));
            }
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["getNotifications"] }),
    });
}
