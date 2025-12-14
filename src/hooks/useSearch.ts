import { complexSearchProducts } from "@/client";
import { mapPersonalizedGetProductDataToOverviewProduct } from "@/data/internal/OverviewProduct.ts";
import {
    type InfiniteData,
    useInfiniteQuery,
    type UseInfiniteQueryResult,
} from "@tanstack/react-query";
import type { SearchFilterArguments } from "@/data/internal/SearchFilterArguments.ts";
import type { SearchResultData } from "@/data/internal/SearchResultData.ts";
import { mapToBackendState } from "@/data/internal/ProductState.ts";
import { mapToBackendSortModeArguments } from "@/data/internal/SortMode.ts";
import { useApiError } from "@/hooks/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/ApiError.ts";

const PAGE_SIZE = 21;

export function useSearch(
    searchArgs: SearchFilterArguments,
): UseInfiniteQueryResult<InfiniteData<SearchResultData>> {
    const { getErrorMessage } = useApiError();

    return useInfiniteQuery({
        queryKey: ["search", searchArgs],
        queryFn: async ({ pageParam }) => {
            const result = await complexSearchProducts({
                body: {
                    // TODO: Make language and currency configurable
                    language: "de",
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
                    shopNameQuery: searchArgs.merchant,
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
                    result.data?.items?.map(mapPersonalizedGetProductDataToOverviewProduct) ?? [],
                size: result.data?.size,
                total: result.data?.total,
                searchAfter: result.data?.searchAfter,
            };
        },
        initialPageParam: undefined as Array<unknown> | undefined,
        getNextPageParam: (lastPage) => {
            return lastPage.searchAfter ?? undefined;
        },
        enabled: searchArgs.q.length >= 3,
    });
}
