import type { SearchFilterProductMatchData } from "@/client";
import {
    mapToShippingMatchValuation,
    type ShippingMatchValuation,
} from "@/data/internal/shipping/ShippingSearch.ts";

/** Saved-search match feedback response mapped away from the generated API DTO. */
export type SearchFilterProductMatch = {
    readonly userId: string;
    readonly userSearchFilterId: string;
    readonly userSearchFilterName?: string;
    readonly productListingId: string;
    readonly originEventId: string;
    readonly feedback?: boolean;
    /** FX basis of a match decided against a converted shipping maximum; never rewritten. */
    readonly shippingMatchValuation?: ShippingMatchValuation;
    readonly created: Date;
    readonly updated: Date;
};

export function mapToInternalSearchFilterProductMatch(
    data: SearchFilterProductMatchData,
): SearchFilterProductMatch {
    const shippingMatchValuation = mapToShippingMatchValuation(data.shippingMatchValuation);
    return {
        userId: data.userId,
        userSearchFilterId: data.userSearchFilterId,
        userSearchFilterName: data.userSearchFilterName,
        productListingId: data.productListingId,
        originEventId: data.originEventId,
        feedback: data.feedback,
        ...(shippingMatchValuation ? { shippingMatchValuation } : {}),
        created: new Date(data.created),
        updated: new Date(data.updated),
    };
}
