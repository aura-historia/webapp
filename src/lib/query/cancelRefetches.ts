import type { Query, QueryClient, QueryFilters } from "@tanstack/react-query";

/** A fetch still waiting for a query's first data; route loaders and suspense queries await it. */
export function isFirstLoadInFlight(query: Query): boolean {
    return query.state.data === undefined && query.state.fetchStatus !== "idle";
}

/**
 * Cancel in-flight refetches so responses older than a confirmed write cannot overwrite it.
 *
 * First loads keep running. Cancelling a query that has no data rejects every caller awaiting
 * it — a route loader's `ensureQueryData`, a `useSuspenseQuery` — with a `CancelledError`, which
 * fails the navigation to that page (#1332). Their response may still predate the write, so each
 * one is invalidated once it lands.
 */
export async function cancelRefetches(queryClient: QueryClient, filters: QueryFilters) {
    const queryCache = queryClient.getQueryCache();
    for (const query of queryCache.findAll(filters)) {
        if (!isFirstLoadInFlight(query)) continue;
        void query.promise?.then(
            () => {
                // Skip queries removed meanwhile, e.g. by a viewer change.
                if (queryCache.get(query.queryHash) !== query) return;
                void queryClient.invalidateQueries({ queryKey: query.queryKey, exact: true });
            },
            () => undefined,
        );
    }
    await queryClient.cancelQueries({
        ...filters,
        predicate: (query) => !isFirstLoadInFlight(query) && (filters.predicate?.(query) ?? true),
    });
}
