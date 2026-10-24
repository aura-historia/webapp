import { useQuery } from "@tanstack/react-query";
import { getMyListingSources } from "@/client";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import {
    mapToOwnListingSource,
    type OwnListingSource,
} from "@/data/internal/listing-source/OwnListingSource.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";

export type { OwnListingSource } from "@/data/internal/listing-source/OwnListingSource.ts";

export const OWN_LISTING_SOURCES_QUERY_KEY = ["ownListingSources"] as const;

/** The backend maximum; most accounts fit on one page. */
const OWN_LISTING_SOURCES_PAGE_SIZE = 100;

export function useOwnListingSources(enabled: boolean) {
    const { getErrorMessage } = useApiError();

    return useQuery({
        queryKey: OWN_LISTING_SOURCES_QUERY_KEY,
        queryFn: async ({ signal }) => {
            // Consumers need every current grant, so follow `next` until it is absent.
            const sources: OwnListingSource[] = [];
            const seenCursors = new Set<string>();
            let after: string | undefined;
            do {
                const response = await getMyListingSources({
                    query: { size: OWN_LISTING_SOURCES_PAGE_SIZE, after },
                    cache: "no-store",
                    signal,
                });
                if (response.error) {
                    throw new Error(getErrorMessage(mapToInternalApiError(response.error)));
                }
                sources.push(...response.data.items.map(mapToOwnListingSource));
                after = response.data.next;
                if (after !== undefined) {
                    // A repeated cursor would never finish; fail rather than show a partial list.
                    if (seenCursors.has(after)) {
                        throw new Error("The listing-source pagination did not advance.");
                    }
                    seenCursors.add(after);
                }
            } while (after !== undefined);
            return sources;
        },
        enabled,
        retry: false,
        staleTime: 0,
        gcTime: 0,
    });
}
