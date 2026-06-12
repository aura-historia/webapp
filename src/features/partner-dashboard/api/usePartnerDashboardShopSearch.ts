import type { PartnerDashboardShopSearchItem } from "@/features/partner-dashboard/api/usePartnerApplications.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { useQuery } from "@tanstack/react-query";
import { simpleSearchShops } from "@/client";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { mapToShopDetail } from "@/data/internal/shop/ShopDetail.ts";

export function usePartnerDashboardShopSearch(search: string, enabled: boolean = true) {
    const { getErrorMessage } = useApiError();
    const normalizedSearch = search.trim();

    return useQuery<PartnerDashboardShopSearchItem[]>({
        queryKey: ["partner-dashboard", "shop-search", normalizedSearch],
        queryFn: async () => {
            const response = await simpleSearchShops({
                query: {
                    shopNameQuery: normalizedSearch === "" ? undefined : normalizedSearch,
                    partnerStatus: ["SCRAPED"],
                    sort: normalizedSearch === "" ? "name" : "score",
                    order: "asc",
                    size: 10,
                },
            });

            if (response.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(response.error)));
            }

            return response.data.items
                .map((item) => {
                    const shop = mapToShopDetail(item);
                    return {
                        shopId: shop.shopId,
                        shopSlugId: shop.shopSlugId,
                        name: shop.name,
                        partnerStatus: shop.partnerStatus,
                    };
                })
                .filter((shop) => shop.partnerStatus !== "PARTNERED");
        },
        enabled,
        staleTime: 30 * 1000,
    });
}
