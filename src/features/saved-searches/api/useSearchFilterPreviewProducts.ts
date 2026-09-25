import { getSearchFilterPreviewProducts } from "@/client";
import {
    mapPersonalizedProductListingSummary,
    type ProductListing,
} from "@/data/internal/product/ProductListing.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import { useUserPreferences } from "@/features/preferences/hooks/useUserPreferences.tsx";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export function useSearchFilterPreviewProducts(
    id: string,
    enabled: boolean,
): UseQueryResult<ProductListing[]> {
    const { getErrorMessage } = useApiError();
    const { i18n } = useTranslation();
    const { preferences } = useUserPreferences();

    return useQuery({
        queryKey: ["searchFilterPreviewProducts", id, i18n.language, preferences.currency],
        enabled: !!id && enabled,
        queryFn: async () => {
            const result = await getSearchFilterPreviewProducts({
                path: { userSearchFilterId: id },
                query: {
                    language: parseLanguage(i18n.language),
                    currency: preferences.currency,
                },
            });

            if (result.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(result.error)));
            }

            return result.data.items.map((item) =>
                mapPersonalizedProductListingSummary(item, i18n.language),
            );
        },
    });
}
