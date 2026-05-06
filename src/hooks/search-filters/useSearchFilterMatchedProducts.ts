import { getSearchFilterMatchedProducts } from "@/client";
import {
    mapToInternalSearchFilterMatchProductCollection,
    type SearchFilterMatchProductCollection,
} from "@/data/internal/search-filter/SearchFilterMatchProductCollection.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import { useUserPreferences } from "@/hooks/preferences/useUserPreferences.tsx";
import {
    useInfiniteQuery,
    type InfiniteData,
    type UseInfiniteQueryResult,
} from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

const PAGE_SIZE = 20;

export function useSearchFilterMatchedProducts(
    id: string,
): UseInfiniteQueryResult<InfiniteData<SearchFilterMatchProductCollection>> {
    const { getErrorMessage } = useApiError();
    const { i18n } = useTranslation();
    const { preferences } = useUserPreferences();

    return useInfiniteQuery({
        queryKey: ["searchFilterMatchedProducts", id, i18n.language, preferences.currency],
        enabled: !!id,
        queryFn: async ({ pageParam }) => {
            const result = await getSearchFilterMatchedProducts({
                path: { userSearchFilterId: id },
                query: {
                    language: parseLanguage(i18n.language),
                    currency: preferences.currency,
                    sort: "created",
                    order: "desc",
                    size: PAGE_SIZE,
                    searchAfter: pageParam,
                },
            });

            if (result.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(result.error)));
            }

            return mapToInternalSearchFilterMatchProductCollection(result.data, i18n.language);
        },
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.searchAfter ?? undefined,
    });
}
