import { complexSearchProducts } from "@/client";
import { mapPersonalizedGetProductDataToOverviewProduct } from "@/data/internal/product/OverviewProduct.ts";
import {
    type InfiniteData,
    useInfiniteQuery,
    type UseInfiniteQueryResult,
} from "@tanstack/react-query";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import type { SearchResultData } from "@/data/internal/search/SearchResultData.ts";
import { mapToBackendState } from "@/data/internal/product/ProductState.ts";
import { mapToBackendSortModeArguments } from "@/data/internal/search/SortMode.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useTranslation } from "react-i18next";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import { mapToBackendAuthenticity } from "@/data/internal/quality-indicators/Authenticity.ts";
import { mapToBackendCondition } from "@/data/internal/quality-indicators/Condition.ts";
import { mapToBackendProvenance } from "@/data/internal/quality-indicators/Provenance.ts";
import { mapToBackendRestoration } from "@/data/internal/quality-indicators/Restoration.ts";
import { env } from "@/env.ts";

const PAGE_SIZE = 21;
const isSearchEnabled = env.VITE_FEATURE_SEARCH_ENABLED;

export function useSearch(
    searchArgs: SearchFilterArguments,
): UseInfiniteQueryResult<InfiniteData<SearchResultData>> {
    const { getErrorMessage } = useApiError();
    const { i18n } = useTranslation();

    return useInfiniteQuery({
        queryKey: ["search", searchArgs, i18n.language],
        enabled: isSearchEnabled && searchArgs.q.length >= 3,
        queryFn: async ({ pageParam }) => {
            const result = await complexSearchProducts({
                body: {
                    language: parseLanguage(i18n.language),
                    // TODO: Make currency dynamic
                    currency: "EUR",
                    productQuery: searchArgs.q,
                    ...(searchArgs.priceFrom != null || searchArgs.priceTo != null
                        ? {
                              price: {
                                  min: searchArgs.priceFrom
                                      ? searchArgs.priceFrom * 100
                                      : undefined,
                                  max: searchArgs.priceTo ? searchArgs.priceTo * 100 : undefined,
                              },
                          }
                        : {}),
                    state:
                        searchArgs.allowedStates?.length === 0
                            ? []
                            : searchArgs.allowedStates?.map((state) => mapToBackendState(state)),
                    ...(searchArgs.creationDateFrom != null || searchArgs.creationDateTo != null
                        ? {
                              created: {
                                  min: searchArgs.creationDateFrom?.toISOString() || undefined,
                                  max: searchArgs.creationDateTo?.toISOString() || undefined,
                              },
                          }
                        : {}),
                    ...(searchArgs.updateDateFrom != null || searchArgs.updateDateTo != null
                        ? {
                              updated: {
                                  min: searchArgs.updateDateFrom?.toISOString() || undefined,
                                  max: searchArgs.updateDateTo?.toISOString() || undefined,
                              },
                          }
                        : {}),
                    shopName: searchArgs.merchant?.length === 0 ? undefined : searchArgs.merchant,
                    ...(searchArgs.originYearMin != null || searchArgs.originYearMax != null
                        ? {
                              originYear: {
                                  min: searchArgs.originYearMin ?? undefined,
                                  max: searchArgs.originYearMax ?? undefined,
                              },
                          }
                        : {}),
                    authenticity:
                        searchArgs.authenticity?.length === 0
                            ? []
                            : searchArgs.authenticity?.map((authenticity) =>
                                  mapToBackendAuthenticity(authenticity),
                              ),
                    condition:
                        searchArgs.condition?.length === 0
                            ? []
                            : searchArgs.condition?.map((condition) =>
                                  mapToBackendCondition(condition),
                              ),
                    provenance:
                        searchArgs.provenance?.length === 0
                            ? []
                            : searchArgs.provenance?.map((provenance) =>
                                  mapToBackendProvenance(provenance),
                              ),
                    restoration:
                        searchArgs.restoration?.length === 0
                            ? []
                            : searchArgs.restoration?.map((restoration) =>
                                  mapToBackendRestoration(restoration),
                              ),
                },
                query: {
                    searchAfter: pageParam,
                    size: PAGE_SIZE,
                    ...mapToBackendSortModeArguments({
                        field: searchArgs.sortField ?? "RELEVANCE",
                        order: searchArgs.sortOrder ?? "DESC",
                    }),
                },
            });

            if (result.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(result.error)));
            }

            return {
                products:
                    result.data?.items?.map((product) =>
                        mapPersonalizedGetProductDataToOverviewProduct(product, i18n.language),
                    ) ?? [],
                size: result.data?.size,
                total: result.data?.total,
                searchAfter: result.data?.searchAfter,
            };
        },
        initialPageParam: undefined as Array<unknown> | undefined,
        getNextPageParam: (lastPage) => {
            return lastPage.searchAfter ?? undefined;
        },
    });
}
