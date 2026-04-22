import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchShopById } from "@/client";
import type { PatchShopData } from "@/client";
import { mapToShopDetail, type ShopDetail } from "@/data/internal/shop/ShopDetail.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { mapToBackendShopType, type ShopType } from "@/data/internal/shop/ShopType.ts";
import { toast } from "sonner";

export type AdminShopPatch = {
    readonly shopId: string;
    readonly shopType?: ShopType;
    readonly domains?: string[];
    readonly image?: string | null;
};

export function usePatchAdminShop() {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();

    return useMutation({
        mutationFn: async (input: AdminShopPatch): Promise<ShopDetail> => {
            const body: PatchShopData = {};
            if (input.shopType !== undefined) {
                body.shopType = mapToBackendShopType(input.shopType) ?? null;
            }
            if (input.domains !== undefined) {
                body.domains = input.domains;
            }
            if (input.image !== undefined) {
                body.image = input.image;
            }

            const response = await patchShopById({
                path: { shopId: input.shopId },
                body,
            });

            if (response.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(response.error)));
            }

            return mapToShopDetail(response.data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "shops"] });
        },
        onError: (error) => {
            console.error("[usePatchAdminShop]", error);
            toast.error(error.message);
        },
    });
}
