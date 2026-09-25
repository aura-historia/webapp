import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchWatchlistProduct } from "@/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";

export function useWatchlistNotificationMutation(productListingId: string) {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();
    const { t } = useTranslation();

    return useMutation({
        mutationFn: async (notificationsEnabled: boolean) => {
            const result = await patchWatchlistProduct({
                path: { productListingId },
                body: { notifications: notificationsEnabled },
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
        onError: (error) => {
            console.error("Error mutating watchlist:", error);
            toast.error(error.message || t("watchlist.loadingError.description"));
        },
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["watchlist"] }),
                queryClient.invalidateQueries({ queryKey: ["getProductListingByTitleSlug"] }),
                queryClient.invalidateQueries({ queryKey: ["getProductListing"] }),
            ]);
        },
    });
}
