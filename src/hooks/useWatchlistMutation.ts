import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addWatchlistItem, deleteWatchlistItem } from "@/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { getItemQueryKey } from "@/client/@tanstack/react-query.gen.ts";

export function useWatchlistMutation(shopId: string, shopsItemId: string) {
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    return useMutation({
        mutationFn: async (isAdded: boolean) => {
            if (isAdded) {
                return await deleteWatchlistItem({
                    path: { shopId: shopId, shopsItemId: shopsItemId },
                });
            } else {
                return await addWatchlistItem({
                    body: { shopId: shopId, shopsItemId: shopsItemId },
                });
            }
        },
        onError: (e) => {
            console.error("Error adding item to watchlist:", e);
            toast.error(t("watchlist.loadingError"));
        },
        onSuccess: async () => {
            await Promise.all([
                await queryClient.invalidateQueries({ queryKey: ["watchlist"] }),
                await queryClient.invalidateQueries({ queryKey: ["search"] }),
                await queryClient.invalidateQueries({
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
