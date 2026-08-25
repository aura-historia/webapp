import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchWatchlistProduct } from "@/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";

export function useWatchlistStateMutation(shopId: string, shopsProductId: string) {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();
    const { t } = useTranslation();

    return useMutation({
        mutationFn: async (active: boolean) => {
            const result = await patchWatchlistProduct({
                path: { shopId, shopsProductId },
                body: { state: active ? "ACTIVE" : "INACTIVE_BY_USER" },
            });

            if (result.error) {
                if (result.response?.status === 401) {
                    toast.info(t("watchlist.loginRequired"));
                    return;
                }
                throw new Error(getErrorMessage(mapToInternalApiError(result.error)));
            }

            return result.data;
        },
        onError: (e) => {
            console.error("Error mutating watchlist state:", e);
            toast.error(e.message || t("watchlist.loadingError"));
        },
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["watchlist"] }),
                queryClient.invalidateQueries({ queryKey: ["search"] }),
            ]);
        },
    });
}
