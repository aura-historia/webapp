import type { SearchFilterProductMatchData } from "@/client";

/** Saved-search match feedback response mapped away from the generated API DTO. */
export type SearchFilterProductMatch = {
    readonly userId: string;
    readonly userSearchFilterId: string;
    readonly userSearchFilterName?: string;
    readonly productListingId: string;
    readonly originEventId: string;
    readonly enhancedMatchReason?: string;
    readonly feedback?: boolean;
    readonly created: Date;
    readonly updated: Date;
};

export function mapToInternalSearchFilterProductMatch(
    data: SearchFilterProductMatchData,
): SearchFilterProductMatch {
    return {
        userId: data.userId,
        userSearchFilterId: data.userSearchFilterId,
        userSearchFilterName: data.userSearchFilterName,
        productListingId: data.productListingId,
        originEventId: data.originEventId,
        enhancedMatchReason: data.enhancedMatchReason,
        feedback: data.feedback,
        created: new Date(data.created),
        updated: new Date(data.updated),
    };
}
