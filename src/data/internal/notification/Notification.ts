import type {
    GetNotificationData,
    NotificationCollectionData,
    NotificationPayloadData,
    PriceChangeWatchlistPayloadData,
    SearchFilterNotificationPayloadData,
    StateChangeWatchlistPayloadData,
    WatchlistNotificationPayloadData,
    WatchlistPayloadData,
} from "@/client";
import { parsePrice, type Price } from "@/data/internal/price/Price.ts";
import {
    mapToInternalProductImage,
    type ProductImage,
} from "@/data/internal/product/ProductImageData.ts";
import { parseProductState, type ProductState } from "@/data/internal/product/ProductState.ts";

export type NotificationWatchlistPriceChangePayload = {
    readonly type: "PRICE_CHANGE";
    readonly oldPrice?: Price;
    readonly newPrice?: Price;
};

export type NotificationWatchlistStateChangePayload = {
    readonly type: "STATE_CHANGE";
    readonly oldState: ProductState;
    readonly newState: ProductState;
};

export type NotificationWatchlistPayload =
    | NotificationWatchlistPriceChangePayload
    | NotificationWatchlistStateChangePayload;

export type NotificationWatchlist = {
    readonly type: "WATCHLIST";
    readonly productId: string;
    readonly shopId: string;
    readonly shopsProductId: string;
    readonly shopSlugId: string;
    readonly productSlugId: string;
    readonly shopName: string;
    readonly productTitle: string;
    readonly image?: ProductImage;
    readonly watchlistPayload: NotificationWatchlistPayload;
};

export type NotificationSearchFilter = {
    readonly type: "SEARCH_FILTER";
    readonly productId: string;
    readonly shopId: string;
    readonly shopsProductId: string;
    readonly shopSlugId: string;
    readonly productSlugId: string;
    readonly shopName: string;
    readonly productTitle: string;
    readonly image?: ProductImage;
    readonly searchFilterId: string;
    readonly searchFilterName: string;
};

export type NotificationPayload = NotificationWatchlist | NotificationSearchFilter;

export type Notification = {
    readonly originEventId: string;
    readonly notificationId: string;
    readonly payload: NotificationPayload;
    readonly seen: boolean;
    readonly external: boolean;
    readonly created: Date;
    readonly updated: Date;
};

export type NotificationCollection = {
    readonly items: readonly Notification[];
    readonly size: number;
    readonly total?: number;
    readonly searchAfter?: string;
};

function mapToWatchlistPriceChangePayload(
    apiData: PriceChangeWatchlistPayloadData,
): NotificationWatchlistPriceChangePayload {
    return {
        type: "PRICE_CHANGE",
        oldPrice: apiData.oldPrice ? parsePrice(apiData.oldPrice) : undefined,
        newPrice: apiData.newPrice ? parsePrice(apiData.newPrice) : undefined,
    };
}

function mapToWatchlistStateChangePayload(
    apiData: StateChangeWatchlistPayloadData,
): NotificationWatchlistStateChangePayload {
    return {
        type: "STATE_CHANGE",
        oldState: parseProductState(apiData.oldState),
        newState: parseProductState(apiData.newState),
    };
}

function mapToWatchlistPayload(apiData: WatchlistPayloadData): NotificationWatchlistPayload {
    switch (apiData.type) {
        case "PRICE_CHANGE":
            return mapToWatchlistPriceChangePayload(apiData);
        case "STATE_CHANGE":
            return mapToWatchlistStateChangePayload(apiData);
    }
}

function mapToNotificationWatchlist(
    apiData: WatchlistNotificationPayloadData,
): NotificationWatchlist {
    return {
        type: "WATCHLIST",
        productId: apiData.productId,
        shopId: apiData.shopId,
        shopsProductId: apiData.shopsProductId,
        shopSlugId: apiData.shopSlugId,
        productSlugId: apiData.productSlugId,
        shopName: apiData.shopName,
        productTitle: apiData.title.text,
        image: apiData.image ? mapToInternalProductImage(apiData.image) : undefined,
        watchlistPayload: mapToWatchlistPayload(apiData.watchlistPayload),
    };
}

function mapToNotificationSearchFilter(
    apiData: SearchFilterNotificationPayloadData,
): NotificationSearchFilter {
    return {
        type: "SEARCH_FILTER",
        productId: apiData.productId,
        shopId: apiData.shopId,
        shopsProductId: apiData.shopsProductId,
        shopSlugId: apiData.shopSlugId,
        productSlugId: apiData.productSlugId,
        shopName: apiData.shopName,
        productTitle: apiData.title.text,
        image: apiData.image ? mapToInternalProductImage(apiData.image) : undefined,
        searchFilterId: apiData.searchFilterPayload.userSearchFilterId,
        searchFilterName: apiData.searchFilterPayload.userSearchFilterName,
    };
}

function mapToNotificationPayload(apiData: NotificationPayloadData): NotificationPayload {
    switch (apiData.type) {
        case "WATCHLIST":
            return mapToNotificationWatchlist(apiData);
        case "SEARCH_FILTER":
            return mapToNotificationSearchFilter(apiData);
    }
}

export function mapToInternalNotification(apiData: GetNotificationData): Notification {
    return {
        originEventId: apiData.originEventId,
        notificationId: apiData.notificationId,
        payload: mapToNotificationPayload(apiData.payload),
        seen: apiData.seen,
        external: apiData.external,
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
        total: apiData.total ?? undefined,
        searchAfter: apiData.searchAfter ?? undefined,
    };
}
