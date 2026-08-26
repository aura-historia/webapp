import { simpleSearchProducts } from "@/client";
import {
    mapPersonalizedGetProductSummaryDataToOverviewProduct,
    type OverviewProduct,
} from "@/data/internal/product/OverviewProduct.ts";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import { useTranslation } from "react-i18next";
import { useUserPreferences } from "@/features/preferences/hooks/useUserPreferences.tsx";

const DEALER_PRODUCTS_SIZE = 8;

export function useDealerProducts(
    shopName: string,
    excludeProductId: string,
): UseQueryResult<OverviewProduct[]> {
    const { getErrorMessage } = useApiError();
    const { i18n } = useTranslation();
    const { preferences } = useUserPreferences();

    return useQuery({
        queryKey: [
            "dealerProducts",
            shopName,
            excludeProductId,
            i18n.language,
            preferences.currency,
        ],
        queryFn: async () => {
            const result = await simpleSearchProducts({
                query: {
                    language: parseLanguage(i18n.language),
                    currency: preferences.currency,
                    size: DEALER_PRODUCTS_SIZE,
                    sort: "updated",
                    order: "desc",
                    shopName: [shopName],
                    excludeProductId: [excludeProductId],
                },
            });

            if (result.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(result.error)));
            }

            return (
                result.data?.items?.map((product) =>
                    mapPersonalizedGetProductSummaryDataToOverviewProduct(product, i18n.language),
                ) ?? []
            );
        },
    });
}
