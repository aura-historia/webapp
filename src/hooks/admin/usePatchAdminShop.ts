import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { patchShopById } from "@/client";
import type { PatchShopData, StructuredAddressData } from "@/client";
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
    readonly url?: string | null;
    readonly image?: string | null;
    readonly structuredAddress?: StructuredAddress | null;
    readonly phone?: string | null;
    readonly email?: string | null;
    readonly specialitiesCategories?: string[] | null;
    readonly specialitiesPeriods?: string[] | null;
};

function toApiStructuredAddress(addr: StructuredAddress): StructuredAddressData {
    return {
        ...addr,
        // `country` and `continent` are finite enums in the generated API type
        // but plain optional strings in the domain model.  Cast so TypeScript
        // is satisfied; the backend validates and derives `continent` when
        // it is omitted.
        country: addr.country as StructuredAddressData["country"],
        continent: addr.continent as StructuredAddressData["continent"],
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
            if (input.url !== undefined) {
                body.url = input.url;
            }
            if (input.image !== undefined) {
                body.image = input.image;
            }
            if (input.structuredAddress !== undefined) {
                body.structuredAddress = input.structuredAddress
                    ? toApiStructuredAddress(input.structuredAddress)
                    : null;
            }
            if (input.phone !== undefined) {
                body.phone = input.phone;
            }
            if (input.email !== undefined) {
                body.email = input.email;
            }
            if (input.specialitiesCategories !== undefined) {
                body.specialitiesCategories = input.specialitiesCategories;
            }
            if (input.specialitiesPeriods !== undefined) {
                body.specialitiesPeriods = input.specialitiesPeriods;
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
            queryClient.setQueriesData<InfiniteData<AdminShopPage>>(
                { queryKey: ["admin", "shops"] },
                (old) => {
                    if (!old) return old;
                    return {
                        ...old,
                        pageParams: old.pageParams,
                        pages: old.pages.map((page) => ({
                            ...page,
                            items: page.items.map((item) =>
                                item.shopId === updatedShop.shopId ? updatedShop : item,
                            ),
                        })),
                    };
                },
            );
            queryClient.invalidateQueries({ queryKey: ["admin", "shops"], refetchType: "none" });
        },
        onError: (error) => {
            console.error("[usePatchAdminShop]", error);
            toast.error(error.message);
        },
    });
}
