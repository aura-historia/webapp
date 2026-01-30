import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchWatchlistProduct, type PersonalizedGetProductData } from "@/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { getProductQueryKey } from "@/client/@tanstack/react-query.gen.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { parseLanguage } from "@/data/internal/common/Language.ts";

export function useWatchlistNotificationMutation(shopId: string, shopsProductId: string) {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();

    const { t, i18n } = useTranslation();

    return useMutation({
        mutationFn: async (notificationsEnabled: boolean) => {
            const result = await patchWatchlistProduct({
                path: { shopId, shopsProductId },
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
            if (!data) return;

            // Update product detail query
            queryClient.setQueryData(
                getProductQueryKey({
                    headers: { "Accept-Language": parseLanguage(i18n.language) },
                    path: { shopId, shopsProductId },
                }),
                (old: PersonalizedGetProductData | undefined) =>
                    old && {
                        ...old,
                        userState: {
                            ...old.userState,
                            watchlist: {
                                watching: old.userState?.watchlist?.watching ?? true,
                                notifications: data.notifications,
                            },
                        },
                    },
            );

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["watchlist"] }),
                queryClient.invalidateQueries({ queryKey: ["search"] }),
            ]);
        },
    });
}
