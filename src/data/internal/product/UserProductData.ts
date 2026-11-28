import type { ProductListingCollectionUserStateData, ProductListingUserStateData } from "@/client";
import {
    mapToPersonalizedShippingDetail,
    mapToPersonalizedShippingSummary,
    type PersonalizedShippingDetail,
    type PersonalizedShippingSummary,
} from "@/data/internal/shipping/ListingShipping.ts";
import {
    mapToShippingMatchValuation,
    type ShippingMatchValuation,
} from "@/data/internal/shipping/ShippingSearch.ts";

/**
 * Viewer-specific listing state after converting the personalized API wrapper. Each section is
 * present only when the backend returns it; an omitted section is unknown, not `false` or empty.
 * `shipping` is the private assessment for the viewer's selected destination: the bounded
 * summary on collection items, the detail on single-listing reads.
 */
export type ProductListingUserState<
    TShipping extends PersonalizedShippingSummary | PersonalizedShippingDetail = never,
> = {
    readonly watchlist?: {
        readonly watching: boolean;
        readonly notifications: boolean;
    };
    readonly contentVisibility?: {
        readonly showUnassessedOrSensitiveContent: boolean;
    };
    readonly notification?: {
        readonly unseenNotificationIds: readonly string[];
        readonly hasUnseenNotification: boolean;
    };
    readonly searchFilter?: {
        readonly matched: boolean;
        readonly hidden: boolean;
        readonly userSearchFilterId?: string;
        readonly userSearchFilterName?: string;
        readonly matchFeedback?: boolean;
        /** FX basis of a match decided against a converted shipping maximum. */
        readonly shippingMatchValuation?: ShippingMatchValuation;
    };
    readonly shipping?: TShipping;
};

export type CollectionListingUserState = ProductListingUserState<PersonalizedShippingSummary>;
export type DetailListingUserState = ProductListingUserState<PersonalizedShippingDetail>;

/** Detail and collection responses share these sections; only their `shipping` differs. */
type ProductListingUserStateDto = Omit<
    ProductListingUserStateData | ProductListingCollectionUserStateData,
    "shipping"
>;

/**
 * Maps the shared viewer-state sections and derives unread status from its ID collection.
 * Shipping is mapped by `mapCollectionListingUserState` and `mapDetailListingUserState`.
 */
export function mapProductListingUserState(
    apiData: ProductListingUserStateDto | null | undefined,
): ProductListingUserState | null | undefined {
    if (apiData == null) return apiData;

    const { watchlist, contentVisibility, notification, searchFilter } = apiData;
    const unseenNotificationIds = notification ? [...notification.unseenNotificationIds] : [];

    return {
        ...(watchlist
            ? {
                  watchlist: {
                      watching: watchlist.watching,
                      notifications: watchlist.notifications,
                  },
              }
            : {}),
        ...(contentVisibility
            ? {
                  contentVisibility: {
                      showUnassessedOrSensitiveContent:
                          contentVisibility.showUnassessedOrSensitiveContent,
                  },
              }
            : {}),
        ...(notification
            ? {
                  notification: {
                      unseenNotificationIds,
                      hasUnseenNotification: unseenNotificationIds.length > 0,
                  },
              }
            : {}),
        ...(searchFilter ? { searchFilter: mapSearchFilterState(searchFilter) } : {}),
    };
}

function mapSearchFilterState(
    searchFilter: NonNullable<ProductListingUserStateDto["searchFilter"]>,
): NonNullable<ProductListingUserState["searchFilter"]> {
    const { shippingMatchValuation: valuationData, ...state } = searchFilter;
    const shippingMatchValuation = mapToShippingMatchValuation(valuationData);
    return { ...state, ...(shippingMatchValuation ? { shippingMatchValuation } : {}) };
}

/** Collection items: the private shipping summary for the selected destination. */
export function mapCollectionListingUserState(
    apiData: ProductListingCollectionUserStateData | null | undefined,
): CollectionListingUserState | null | undefined {
    const state = mapProductListingUserState(apiData);
    if (state == null) return state;
    const shipping = mapToPersonalizedShippingSummary(apiData?.shipping);
    return shipping ? { ...state, shipping } : state;
}

/** Single-listing reads: the private shipping detail for the selected destination. */
export function mapDetailListingUserState(
    apiData: ProductListingUserStateData | null | undefined,
): DetailListingUserState | null | undefined {
    const state = mapProductListingUserState(apiData);
    if (state == null) return state;
    const shipping = mapToPersonalizedShippingDetail(apiData?.shipping);
    return shipping ? { ...state, shipping } : state;
}
