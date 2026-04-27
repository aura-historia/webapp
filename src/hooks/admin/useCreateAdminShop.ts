import {
    useMutation,
    useQueryClient,
    type InfiniteData,
    type QueryKey,
} from "@tanstack/react-query";
import { postShop } from "@/client";
import type { StructuredAddressData } from "@/client";
import {
    mapToShopDetail,
    type ShopDetail,
    type StructuredAddress,
} from "@/data/internal/shop/ShopDetail.ts";
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
    readonly structuredAddress?: StructuredAddress | null;
    readonly phone?: string | null;
    readonly email?: string | null;
    readonly specialitiesCategories?: string[];
    readonly specialitiesPeriods?: string[];
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
                    structuredAddress: input.structuredAddress
                        ? toApiStructuredAddress(input.structuredAddress)
                        : undefined,
                    phone: input.phone ?? undefined,
                    email: input.email ?? undefined,
                    specialitiesCategories:
                        input.specialitiesCategories && input.specialitiesCategories.length > 0
                            ? input.specialitiesCategories
                            : undefined,
                    specialitiesPeriods:
                        input.specialitiesPeriods && input.specialitiesPeriods.length > 0
                            ? input.specialitiesPeriods
                            : undefined,
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
