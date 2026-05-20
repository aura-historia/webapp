import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postShop } from "@/client";
import type { PostShopData } from "@/client";
import {
    mapToShopDetail,
    type ShopDetail,
    type StructuredAddress,
} from "@/data/internal/shop/ShopDetail.ts";
import type { CurrencyData, LanguageData } from "@/client";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { mapToBackendShopType } from "@/data/internal/shop/ShopType.ts";
import type { EditableShopType } from "@/components/admin/adminShopFormUtils.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { toast } from "sonner";

export type AdminShopCreate = {
    readonly name: string;
    readonly shopType: EditableShopType;
    readonly domains: string[];
    readonly shopifyDomain?: string | null;
    readonly shopifyCurrency?: CurrencyData | null;
    readonly shopifyLanguage?: LanguageData | null;
    readonly woocommerceCurrency?: CurrencyData | null;
    readonly woocommerceLanguage?: LanguageData | null;
    readonly url?: string | null;
    readonly image?: string | null;
    readonly structuredAddress?: StructuredAddress | null;
    readonly phone?: string | null;
    readonly email?: string | null;
};

export function useCreateAdminShop() {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();

    return useMutation({
        mutationFn: async (input: AdminShopCreate): Promise<ShopDetail> => {
            const shopType = mapToBackendShopType(input.shopType);

            if (!shopType) {
                throw new Error("Invalid shop type");
            }

            const body: PostShopData = {
                name: input.name,
                shopType,
                domains: input.domains,
            };
            if (input.shopifyDomain !== undefined) {
                body.shopifyDomain = input.shopifyDomain;
            }
            if (input.shopifyCurrency !== undefined) {
                body.shopifyCurrency = input.shopifyCurrency;
            }
            if (input.shopifyLanguage !== undefined) {
                body.shopifyLanguage = input.shopifyLanguage;
            }
            if (input.woocommerceCurrency !== undefined) {
                body.woocommerceCurrency = input.woocommerceCurrency;
            }
            if (input.woocommerceLanguage !== undefined) {
                body.woocommerceLanguage = input.woocommerceLanguage;
            }
            if (input.url !== undefined) {
                body.url = input.url;
            }
            if (input.image !== undefined) {
                body.image = input.image;
            }
            if (input.structuredAddress) {
                body.structuredAddress = input.structuredAddress;
            }
            if (input.phone !== undefined) {
                body.phone = input.phone;
            }
            if (input.email !== undefined) {
                body.email = input.email;
            }
            const response = await postShop({ body });

            if (response.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(response.error)));
            }

            return mapToShopDetail(response.data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "shops"] });
        },
        onError: (error) => {
            console.error("[useCreateAdminShop]", error);
            toast.error(error.message);
        },
    });
}
