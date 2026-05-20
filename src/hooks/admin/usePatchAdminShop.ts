import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { patchShopById } from "@/client";
import type { CurrencyData, LanguageData, PatchShopData } from "@/client";
import {
    mapToShopDetail,
    type ShopDetail,
    type StructuredAddress,
} from "@/data/internal/shop/ShopDetail.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { mapToBackendShopType, type ShopType } from "@/data/internal/shop/ShopType.ts";
import { toast } from "sonner";
import type { AdminShopPage } from "@/hooks/admin/useAdminShops.ts";

export type AdminShopPatch = {
    readonly shopId: string;
    readonly shopType?: ShopType;
    readonly domains?: string[];
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

function replaceUpdatedShopInPages(
    old: InfiniteData<AdminShopPage> | undefined,
    updatedShop: ShopDetail,
): InfiniteData<AdminShopPage> | undefined {
    if (!old || !("pages" in old) || !Array.isArray(old.pages)) return old;

    const pages = old.pages.map((page) => ({
        ...page,
        items: page.items.map((item) => (item.shopId === updatedShop.shopId ? updatedShop : item)),
    }));

    return {
        ...old,
        pageParams: old.pageParams,
        pages,
    };
}

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
            if (input.structuredAddress !== undefined) {
                body.structuredAddress = input.structuredAddress ?? null;
            }
            if (input.phone !== undefined) {
                body.phone = input.phone;
            }
            if (input.email !== undefined) {
                body.email = input.email;
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
        onSuccess: (updatedShop) => {
            queryClient.setQueryData(["admin", "shops", "detail", updatedShop.shopId], updatedShop);
            queryClient.setQueriesData<InfiniteData<AdminShopPage>>(
                { queryKey: ["admin", "shops"] },
                (old) => replaceUpdatedShopInPages(old, updatedShop),
            );
            queryClient.invalidateQueries({ queryKey: ["admin", "shops"], refetchType: "none" });
        },
        onError: (error) => {
            console.error("[usePatchAdminShop]", error);
            toast.error(error.message);
        },
    });
}
