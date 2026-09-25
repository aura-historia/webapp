import type {
    ListingAvailabilityData,
    NotificationCollectionData,
    NotificationData,
    NotificationPayloadData,
    PartnershipApplicationNotificationPayloadData,
    ProductListingImageData,
    ProductListingPriceData,
    SearchFilterNotificationPayloadData,
    WatchlistNotificationPayloadData,
} from "@/client";
import type { ProductImage } from "@/data/internal/product/ProductImageData.ts";

export type NotificationWatchlistPriceChangePayload = {
    readonly type: "PRICE_CHANGE";
    readonly oldPrice: ProductListingPriceData | null;
    readonly newPrice: ProductListingPriceData | null;
};

export type NotificationWatchlistAvailabilityChangePayload = {
    readonly type: "AVAILABILITY_CHANGE";
    readonly oldAvailability: ListingAvailabilityData | null;
    readonly newAvailability: ListingAvailabilityData | null;
};

export type NotificationWatchlistChangePayload =
    | NotificationWatchlistPriceChangePayload
    | NotificationWatchlistAvailabilityChangePayload;

export type NotificationWatchlist = {
    readonly type: "WATCHLIST";
    readonly productListingId: string;
    readonly productListingTitleSlugId?: string;
    readonly listingSourceId: string;
    readonly listingSourceSlugId: string;
    readonly listingSourceName: string;
    readonly sourceListingId: string;
    readonly productTitle?: string;
    readonly image?: ProductImage;
    readonly change: NotificationWatchlistChangePayload;
};

export type NotificationSearchFilter = {
    readonly type: "SEARCH_FILTER";
    readonly productListingId: string;
    readonly productListingTitleSlugId?: string;
    readonly listingSourceId: string;
    readonly listingSourceSlugId: string;
    readonly listingSourceName: string;
    readonly sourceListingId: string;
    readonly productTitle?: string;
    readonly image?: ProductImage;
    readonly userSearchFilterId: string;
    readonly userSearchFilterName: string;
};

export type NotificationProductPayload = NotificationWatchlist | NotificationSearchFilter;

export type NotificationPartnerApplication = {
    readonly type: "PARTNER_APPLICATION";
    readonly listingSourceName: string;
    readonly image?: string;
    readonly partnershipApplicationId: string;
    readonly decision: "APPROVED" | "REJECTED";
};

export type NotificationPayload = NotificationProductPayload | NotificationPartnerApplication;

export function isProductNotification(
    payload: NotificationPayload,
): payload is NotificationProductPayload {
    return payload.type === "WATCHLIST" || payload.type === "SEARCH_FILTER";
}

export type Notification = {
    readonly notificationId: string;
    readonly payload: NotificationPayload;
    readonly seen: boolean;
    readonly created: Date;
    readonly updated: Date;
};

export type NotificationCollection = {
    readonly items: readonly Notification[];
    readonly size: number;
    readonly searchAfter?: string;
};

function mapImage(data: ProductListingImageData | null): ProductImage | undefined {
    if (!data?.url) return undefined;
    const url = URL.parse(data.url);
    return url ? { url, prohibitedContentType: "NONE" } : undefined;
}

function mapProductFields(
    data: WatchlistNotificationPayloadData | SearchFilterNotificationPayloadData,
) {
    return {
        productListingId: data.productListingId,
        productListingTitleSlugId: data.productListingTitleSlugId || undefined,
        listingSourceId: data.listingSourceId,
        listingSourceSlugId: data.listingSourceSlugId,
        listingSourceName: data.listingSourceName,
        sourceListingId: data.sourceListingId,
        productTitle: data.title?.text ?? undefined,
        image: mapImage(data.image),
    };
}

function mapWatchlistNotification(data: WatchlistNotificationPayloadData): NotificationWatchlist {
    const common = mapProductFields(data);
    return {
        type: "WATCHLIST",
        ...common,
        change:
            data.change.type === "PRICE_CHANGE"
                ? {
                      type: "PRICE_CHANGE",
                      oldPrice: data.change.oldPrice,
                      newPrice: data.change.newPrice,
                  }
                : {
                      type: "AVAILABILITY_CHANGE",
                      oldAvailability: data.change.oldAvailability,
                      newAvailability: data.change.newAvailability,
                  },
    };
}

function mapSearchFilterNotification(
    data: SearchFilterNotificationPayloadData,
): NotificationSearchFilter {
    return {
        type: "SEARCH_FILTER",
        ...mapProductFields(data),
        userSearchFilterId: data.userSearchFilterId,
        userSearchFilterName: data.userSearchFilterName,
    };
}

function mapPartnershipApplicationNotification(
    data: PartnershipApplicationNotificationPayloadData,
): NotificationPartnerApplication {
    return {
        type: "PARTNER_APPLICATION",
        listingSourceName: data.listingSourceName,
        image: data.image ?? undefined,
        partnershipApplicationId: data.partnershipApplicationId,
        decision: data.decision,
    };
}

function mapNotificationPayload(
    kind: NotificationData["kind"],
    payload: NotificationPayloadData,
): NotificationPayload {
    switch (kind) {
        case "WATCHLIST_PRICE_CHANGED":
        case "WATCHLIST_AVAILABILITY_CHANGED":
            return mapWatchlistNotification(payload as WatchlistNotificationPayloadData);
        case "SEARCH_FILTER_MATCH":
            return mapSearchFilterNotification(payload as SearchFilterNotificationPayloadData);
        case "PARTNERSHIP_APPLICATION_APPROVED":
        case "PARTNERSHIP_APPLICATION_REJECTED":
            return mapPartnershipApplicationNotification(
                payload as PartnershipApplicationNotificationPayloadData,
            );
    }
}

export function mapToInternalNotification(apiData: NotificationData): Notification {
    return {
        notificationId: apiData.notificationId,
        payload: mapNotificationPayload(apiData.kind, apiData.payload),
        seen: apiData.seen,
        created: new Date(apiData.created),
        updated: new Date(apiData.updated),
    };
}

export function mapToInternalNotificationCollection(
    apiData: NotificationCollectionData,
): NotificationCollection {
    return {
        items: apiData.items.map(mapToInternalNotification),
        size: apiData.size,
        searchAfter: apiData.searchAfter ? JSON.stringify(apiData.searchAfter) : undefined,
    };
}
