import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchWatchlistProduct, type PersonalizedGetProductData } from "@/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { getProductQueryKey } from "@/client/@tanstack/react-query.gen.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/ApiError.ts";
import { parseLanguage } from "@/data/internal/Language.ts";

export function useWatchlistNotificationMutation(shopId: string, shopsProductId: string) {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();

    const { t, i18n } = useTranslation();

    return useMutation({
        mutationFn: async (notificationsEnabled: boolean) => {
            const result = await patchWatchlistProduct({
                path: { shopId: shopId, shopsProductId: shopsProductId },
                body: { notifications: notificationsEnabled },
            });

            if (result.error) {
                if (result.response.status === 401) {
                    toast.info(t("watchlist.loginRequired"));
                    return;
                }

                throw new Error(getErrorMessage(mapToInternalApiError(result.error)));
            }

            return result.data;
        },
        onError: (e) => {
            console.error("Error mutating watchlist:", e);
            toast.error(e.message || t("watchlist.loadingError"));
        },
        onSuccess: async (data) => {
            // Update the product query data with the new notification state
            const queryKey = getProductQueryKey({
                headers: {
                    "Accept-Language": parseLanguage(i18n.language),
                },
                path: { shopId: shopId, shopsProductId: shopsProductId },
                query: {
                    history: true,
                },
            });

            queryClient.setQueryData(
                queryKey,
                (oldData: PersonalizedGetProductData | undefined) => {
                    if (!oldData) {
                        // If the query doesn't exist yet, we can't update it
                        console.warn("Product query data not found for update");
                        return oldData;
                    }

                    return {
                        ...oldData,
                        userState: {
                            ...oldData.userState,
                            watchlist: {
                                ...oldData.userState?.watchlist,
                                notifications: data?.notifications ?? false,
                                watching: oldData.userState?.watchlist?.watching ?? true,
                            },
                        },
                    };
                },
            );

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["watchlist"] }),
                queryClient.invalidateQueries({ queryKey: ["search"] }),
            ]);
        },
    });
}
