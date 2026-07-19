import { useQuery } from "@tanstack/react-query";
import { getMyPartnerShops } from "@/client";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { mapToShopDetail, type ShopDetail } from "@/data/internal/shop/ShopDetail.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";

export const PARTNER_SHOPS_QUERY_KEY = ["partner-shops"] as const;

export function useMyPartnerShops() {
    const { getErrorMessage } = useApiError();

    return useQuery<ShopDetail[]>({
        queryKey: PARTNER_SHOPS_QUERY_KEY,
        queryFn: async () => {
            const response = await getMyPartnerShops();
            if (response.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(response.error)));
            }

            return response.data.map(mapToShopDetail);
        },
        staleTime: 30 * 1000,
    });
}
