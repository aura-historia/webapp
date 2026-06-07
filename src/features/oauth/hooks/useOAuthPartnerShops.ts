import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getMyPartnerShops } from "@/client";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";

export interface OAuthPartnerShop {
    readonly shopId: string;
    readonly name: string;
}

export function useOAuthPartnerShops(enabled: boolean): UseQueryResult<OAuthPartnerShop[]> {
    const { getErrorMessage } = useApiError();

    return useQuery({
        queryKey: ["oauthPartnerShops"],
        queryFn: async () => {
            const response = await getMyPartnerShops();

            if (response.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(response.error)));
            }

            return response.data.map((shop) => ({
                shopId: shop.shopId,
                name: shop.name,
            }));
        },
        enabled,
        retry: false,
        staleTime: 5 * 60 * 1000,
    });
}
