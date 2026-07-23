import { getMyPartnerShops } from "@/client";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";

export interface PartnerShop {
    readonly shopId: string;
    readonly shopSlugId: string;
    readonly name: string;
}

export const PARTNER_SHOPS_QUERY_KEY = ["partnerShops"] as const;

export function usePartnerShops(enabled: boolean): UseQueryResult<PartnerShop[]> {
    const { getErrorMessage } = useApiError();

    return useQuery({
        queryKey: PARTNER_SHOPS_QUERY_KEY,
        queryFn: async () => {
            const response = await getMyPartnerShops();

            if (response.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(response.error)));
            }

            return response.data.map((shop) => ({
                shopId: shop.shopId,
                shopSlugId: shop.shopSlugId,
                name: shop.name,
            }));
        },
        enabled,
        retry: false,
        staleTime: 5 * 60 * 1000,
    });
}
