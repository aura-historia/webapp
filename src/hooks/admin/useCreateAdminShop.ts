import {
    useMutation,
    useQueryClient,
    type InfiniteData,
    type QueryKey,
} from "@tanstack/react-query";
import { postShop } from "@/client";
import { mapToShopDetail, type ShopDetail } from "@/data/internal/shop/ShopDetail.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { mapToBackendShopType } from "@/data/internal/shop/ShopType.ts";
import type { EditableShopType } from "@/components/admin/adminShopFormUtils.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";
import type { AdminShopFilters, AdminShopPage } from "@/hooks/admin/useAdminShops.ts";
import { toast } from "sonner";

export type AdminShopCreate = {
    readonly name: string;
    readonly shopType: EditableShopType;
    readonly domains: string[];
    readonly image?: string | null;
};

function shopMatchesFilters(shop: ShopDetail, filters?: AdminShopFilters): boolean {
    if (!filters) {
        return true;
    }

    if (
        filters.nameQuery &&
        !shop.name.toLocaleLowerCase().includes(filters.nameQuery.toLocaleLowerCase())
    ) {
        return false;
    }

    if (filters.partnerStatus && !filters.partnerStatus.includes(shop.partnerStatus)) {
        return false;
    }

    return true;
}

function extractAdminShopFilters(queryKey: QueryKey): AdminShopFilters | undefined {
    if (
        queryKey.length < 3 ||
        typeof queryKey[2] !== "object" ||
        queryKey[2] === null ||
        Array.isArray(queryKey[2])
    ) {
        return undefined;
    }

    return queryKey[2] as AdminShopFilters;
}

export function useCreateAdminShop() {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();

    return useMutation({
        mutationFn: async (input: AdminShopCreate): Promise<ShopDetail> => {
            const shopType = mapToBackendShopType(input.shopType);

            if (!shopType) {
                throw new Error("Invalid shop type");
            }

            const response = await postShop({
                body: {
                    name: input.name,
                    shopType,
                    domains: input.domains,
                    image: input.image ?? null,
                },
            });

            if (response.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(response.error)));
            }

            return mapToShopDetail(response.data);
        },
        onSuccess: (createdShop) => {
            const cachedQueries = queryClient.getQueriesData<InfiniteData<AdminShopPage>>({
                queryKey: ["admin", "shops"],
            });

            for (const [queryKey, currentData] of cachedQueries) {
                if (!currentData || currentData.pages.length === 0) {
                    continue;
                }

                if (!shopMatchesFilters(createdShop, extractAdminShopFilters(queryKey))) {
                    continue;
                }

                const alreadyCached = currentData.pages.some((page) =>
                    page.items.some((item) => item.shopId === createdShop.shopId),
                );

                if (alreadyCached) {
                    continue;
                }

                queryClient.setQueryData<InfiniteData<AdminShopPage>>(queryKey, {
                    ...currentData,
                    pageParams: currentData.pageParams,
                    pages: currentData.pages.map((page, index) =>
                        index === 0
                            ? {
                                  ...page,
                                  items: [createdShop, ...page.items],
                                  total: page.total !== undefined ? page.total + 1 : undefined,
                              }
                            : page,
                    ),
                });
            }

            queryClient.invalidateQueries({ queryKey: ["admin", "shops"] });
        },
        onError: (error) => {
            console.error("[useCreateAdminShop]", error);
            toast.error(error.message);
        },
    });
}
