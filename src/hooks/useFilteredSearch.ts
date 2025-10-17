import { complexSearchItems } from "@/client";
import { mapToInternalOverviewItem } from "@/data/internal/OverviewItem.ts";
import {
    useInfiniteQuery,
    type UseInfiniteQueryResult,
    type InfiniteData,
} from "@tanstack/react-query";
import type { SearchFilterArguments } from "@/data/internal/SearchFilterArguments.ts";
import type { SearchResultData } from "@/data/internal/SearchResultData.ts";
import { mapToBackendState } from "@/data/internal/ItemState.ts";

const PAGE_SIZE = 21;

export function useFilteredSearch(
    searchArgs: SearchFilterArguments,
): UseInfiniteQueryResult<InfiniteData<SearchResultData>> {
    return useInfiniteQuery({
        queryKey: ["filteredSearch", searchArgs],
        queryFn: async ({ pageParam }) => {
            const result = await complexSearchItems({
                body: {
                    // TODO: Make language and currency configurable
                    language: "de",
                    currency: "EUR",
                    itemQuery: searchArgs.q,
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
                query: { searchAfter: pageParam, size: PAGE_SIZE },
            });

            if (result.error) {
                throw new Error(result.error.message);
            }

            return {
                items: result.data?.items?.map(mapToInternalOverviewItem) ?? [],
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
