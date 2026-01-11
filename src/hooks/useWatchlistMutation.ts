import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addWatchlistProduct, deleteWatchlistProduct } from "@/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { getProductQueryKey } from "@/client/@tanstack/react-query.gen.ts";
import { useApiError } from "@/hooks/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/ApiError.ts";

export type WatchlistMutationType = "addToWatchlist" | "deleteFromWatchlist";

export function useWatchlistMutation(shopId: string, shopsProductId: string) {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();

    const { t } = useTranslation();

    return useMutation({
        mutationFn: async (mutationType: WatchlistMutationType) => {
            const result =
                mutationType === "deleteFromWatchlist"
                    ? await deleteWatchlistProduct({
                          path: { shopId: shopId, shopsProductId: shopsProductId },
                      })
                    : await addWatchlistProduct({
                          body: { shopId: shopId, shopsProductId: shopsProductId },
                      });

            if (result.error) {
                if (result.response.status === 401) {
                    toast.info(t("watchlist.loginRequired"));
                    return;
                } else if (result.response.status === 422) {
                    toast.warning(getErrorMessage(mapToInternalApiError(result.error)));
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
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["watchlist"] }),
                queryClient.invalidateQueries({ queryKey: ["search"] }),
                queryClient.invalidateQueries({
                    queryKey: getProductQueryKey({
                        path: { shopId: shopId, shopsProductId: shopsProductId },
                        query: {
                            history: true,
                        },
                    }),
                }),
            ]);
        },
    });
}
