import { type InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { getMyListingSources } from "@/client";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import {
    combineOwnListingSourcePages,
    mapToOwnListingSourcePage,
    type OwnListingSource,
    type OwnListingSourcePage,
} from "@/data/internal/listing-source/OwnListingSource.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";

export type { OwnListingSource } from "@/data/internal/listing-source/OwnListingSource.ts";

export const OWN_LISTING_SOURCES_QUERY_KEY = ["ownListingSources"] as const;

/** The backend maximum; most accounts fit on one page. */
const OWN_LISTING_SOURCES_PAGE_SIZE = 100;

const NO_SOURCES: readonly OwnListingSource[] = [];

/** Granted sources read page by page, shared by the partner views and OAuth source selection. */
export interface OwnListingSources {
    /** Sources from the loaded pages in page order; empty while pending or after a failed read. */
    readonly sources: readonly OwnListingSource[];
    /** The first page has not loaded yet. */
    readonly isPending: boolean;
    /** The first page or a refresh failed; previously loaded grants are withheld. */
    readonly isError: boolean;
    /** Another page exists, so `sources` is not the complete grant list. */
    readonly hasMore: boolean;
    /** The next page can be requested now (no other read is running). */
    readonly canLoadMore: boolean;
    readonly isLoadingMore: boolean;
    /** The latest next-page read failed; the loaded pages stay and the page can be requested again. */
    readonly isLoadMoreError: boolean;
    readonly loadMore: () => void;
    /** Reads the loaded pages again from the first page. */
    readonly retry: () => void;
}

/** The part of the state that requests further pages. */
export type OwnListingSourcesPaging = Pick<
    OwnListingSources,
    "hasMore" | "canLoadMore" | "isLoadingMore" | "isLoadMoreError" | "loadMore"
>;

function selectSources(data: InfiniteData<OwnListingSourcePage, string | undefined>) {
    return combineOwnListingSourcePages(data.pages);
}

export function useOwnListingSources(enabled: boolean): OwnListingSources {
    const { getErrorMessage } = useApiError();

    const query = useInfiniteQuery({
        queryKey: OWN_LISTING_SOURCES_QUERY_KEY,
        queryFn: async ({ pageParam, signal }) => {
            const response = await getMyListingSources({
                query: { size: OWN_LISTING_SOURCES_PAGE_SIZE, after: pageParam },
                cache: "no-store",
                signal,
            });
            if (response.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(response.error)));
            }
            return mapToOwnListingSourcePage(response.data);
        },
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.next,
        select: selectSources,
        enabled,
        retry: false,
        staleTime: 0,
        gcTime: 0,
    });

    // A failed first page or refresh may hide revoked grants, so never show the previous pages.
    const isReadError = query.isError && !query.isFetchNextPageError;
    const hasMore = !isReadError && query.hasNextPage;
    const canLoadMore = hasMore && !query.isFetching;
    const { fetchNextPage, refetch } = query;

    return {
        sources: isReadError ? NO_SOURCES : (query.data ?? NO_SOURCES),
        isPending: query.isPending,
        isError: isReadError,
        hasMore,
        canLoadMore,
        isLoadingMore: query.isFetchingNextPage,
        isLoadMoreError: query.isFetchNextPageError,
        loadMore: () => {
            // Requesting a page cancels a running refresh, which would continue from stale pages.
            if (canLoadMore) {
                void fetchNextPage();
            }
        },
        retry: () => {
            void refetch();
        },
    };
}
