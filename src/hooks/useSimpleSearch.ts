import { searchItems } from "@/client";
import { mapToInternalOverviewItem } from "@/data/internal/OverviewItem.ts";
import { useQuery } from "@tanstack/react-query";

export function useSimpleSearch(query: string) {
    return useQuery({
        queryKey: ["search", query],
        queryFn: async () => {
            const result = await searchItems({
                query: {
                    q: query,
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
        enabled: query.length >= 3,
    });
}
