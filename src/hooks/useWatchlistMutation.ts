import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addWatchlistItem, deleteWatchlistItem } from "@/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { getItemQueryKey } from "@/client/@tanstack/react-query.gen.ts";
import { useApiError } from "@/hooks/useApiError.ts";

export type WatchlistMutationType = "addToWatchlist" | "deleteFromWatchlist";

export function useWatchlistMutation(shopId: string, shopsItemId: string) {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();

    const { t } = useTranslation();

    return useMutation({
        mutationFn: async (mutationType: WatchlistMutationType) => {
            const result =
                mutationType === "deleteFromWatchlist"
                    ? await deleteWatchlistItem({
                          path: { shopId: shopId, shopsItemId: shopsItemId },
                      })
                    : await addWatchlistItem({
                          body: { shopId: shopId, shopsItemId: shopsItemId },
                      });

            if (result.error) {
                if (result.response.status === 401) {
                    toast.info(t("watchlist.loginRequired"));
                    return;
                }

                throw new Error(getErrorMessage(result.error.error));
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
                    queryKey: getItemQueryKey({
                        path: { shopId: shopId, shopsItemId: shopsItemId },
                        query: {
                            history: true,
                        },
                    }),
                }),
            ]);
        },
    });
}
