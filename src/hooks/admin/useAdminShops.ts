import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getShopById, simpleSearchShops } from "@/client";
import type { ShopPartnerStatusData } from "@/client";
import { mapToShopDetail, type ShopDetail } from "@/data/internal/shop/ShopDetail.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";

const PAGE_SIZE = 25;
const ADMIN_QUERY_OPTIONS = {
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always" as const,
    refetchOnReconnect: "always" as const,
    refetchOnWindowFocus: "always" as const,
};

export type AdminShopFilters = {
    readonly nameQuery?: string;
    readonly partnerStatus?: ShopPartnerStatusData[];
};

export type AdminShopPage = {
    readonly items: ShopDetail[];
    readonly searchAfter?: unknown[];
    readonly total?: number;
};

export function useAdminShops(filters: AdminShopFilters) {
    const { getErrorMessage } = useApiError();

    return useInfiniteQuery({
        queryKey: ["admin", "shops", filters],
        queryFn: async ({ pageParam }): Promise<AdminShopPage> => {
            const response = await simpleSearchShops({
                query: {
                    shopNameQuery: filters.nameQuery || undefined,
                    partnerStatus: filters.partnerStatus,
                    sort: "updated",
                    order: "desc",
                    size: PAGE_SIZE,
                    searchAfter: pageParam,
                },
            });

            if (response.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(response.error)));
            }

            return {
                items: response.data.items.map(mapToShopDetail),
                searchAfter: response.data.searchAfter ?? undefined,
                total: response.data.total ?? undefined,
            };
        },
        initialPageParam: undefined as unknown[] | undefined,
        getNextPageParam: (lastPage) => lastPage.searchAfter ?? undefined,
        ...ADMIN_QUERY_OPTIONS,
    });
}

export function useAdminShop(shopId?: string, enabled = true) {
    const { getErrorMessage } = useApiError();

    return useQuery({
        queryKey: ["admin", "shops", "detail", shopId],
        queryFn: async (): Promise<ShopDetail> => {
            if (!shopId) {
                throw new Error("Missing shop id");
            }

            const response = await getShopById({ path: { shopId } });
            if (response.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(response.error)));
            }

            return mapToShopDetail(response.data);
        },
        enabled: enabled && Boolean(shopId),
        ...ADMIN_QUERY_OPTIONS,
    });
}
