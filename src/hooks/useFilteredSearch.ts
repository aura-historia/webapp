import { complexSearchItems } from "@/client";
import { mapToInternalOverviewItem } from "@/data/internal/OverviewItem.ts";
import { useInfiniteQuery } from "@tanstack/react-query";

import type { SearchFilterArguments } from "@/data/internal/SearchFilterArguments.ts";
import { mapToBackendState } from "@/data/internal/ItemState.ts";

export function useFilteredSearch(searchArgs: SearchFilterArguments) {
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
                query: { searchAfter: pageParam, size: 2 },
            });
            return {
                ...result,
                data: {
                    ...result.data,
                    items: result.data?.items?.map(mapToInternalOverviewItem) ?? [],
                },
            };
        },
        initialPageParam: undefined as Array<unknown> | undefined,
        getNextPageParam: (lastPage) => {
            return lastPage.data?.searchAfter ?? undefined;
        },
        enabled: searchArgs.q.length >= 3,
    });
}
