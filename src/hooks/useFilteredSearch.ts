import { complexSearchItems } from "@/client";
import { mapToInternalOverviewItem } from "@/data/internal/OverviewItem.ts";
import { useQuery } from "@tanstack/react-query";

import type { SearchFilterArguments } from "@/data/internal/SearchFilterArguments.ts";

export function useFilteredSearch(searchArgs: SearchFilterArguments) {
    return useQuery({
        queryKey: ["filteredSearch", searchArgs],
        queryFn: async () => {
            const result = await complexSearchItems({
                body: {
                    itemQuery: searchArgs.q,
                    price: {
                        min: searchArgs.priceFrom,
                        max: searchArgs.priceTo,
                    },
                    state: searchArgs.allowedStates,
                    created: {
                        min: searchArgs.creationDateFrom,
                        max: searchArgs.creationDateTo,
                    },
                    shopNameQuery: searchArgs.merchant,
                },
            });
            return {
                ...result,
                data: {
                    ...result.data,
                    items: result.data?.items?.map(mapToInternalOverviewItem) ?? [],
                },
            };
        },
        enabled: searchArgs.q.length >= 3,
    });
}
