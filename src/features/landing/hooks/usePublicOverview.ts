import { useQuery } from "@tanstack/react-query";
import { getPublicOverview } from "@/client";
import { mapToPublicOverview } from "@/data/internal/overview/PublicOverview.ts";

export const PUBLIC_OVERVIEW_QUERY_KEY = ["public-overview"] as const;

/** The edge caches the overview for 15 minutes and recalculates it every few hours. */
const PUBLIC_OVERVIEW_STALE_TIME = 15 * 60 * 1000;

/**
 * Public catalogue counts for the hero's stat strip. Client-only like the latest listings: the
 * figures change independently of a deployment. The operation declares no security, so the
 * client sends no bearer and the anonymous response stays shareable at the edge.
 */
export function usePublicOverview() {
    return useQuery({
        queryKey: PUBLIC_OVERVIEW_QUERY_KEY,
        staleTime: PUBLIC_OVERVIEW_STALE_TIME,
        queryFn: async ({ signal }) => {
            const { data } = await getPublicOverview({ signal, throwOnError: true });
            return mapToPublicOverview(data);
        },
    });
}
