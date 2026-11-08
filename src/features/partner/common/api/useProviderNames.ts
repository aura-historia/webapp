import { useMemo } from "react";
import type { OwnListingSource } from "@/features/partner/common/api/useOwnListingSources.ts";

/** Names of the granted providers by ID, so an application for an existing provider can show its name. */
export function useProviderNames(
    sources: readonly OwnListingSource[],
): ReadonlyMap<string, string> {
    return useMemo(
        () => new Map(sources.map((source) => [source.listingSourceId, source.name])),
        [sources],
    );
}
