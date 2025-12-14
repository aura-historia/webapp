import type {
    PersonalizedGetProductData,
    WatchlistProductData,
    GetProductData,
    ProductUserStateData,
} from "@/client";
import { formatPrice } from "@/lib/utils.ts";
import { type ProductState, parseProductState } from "@/data/internal/ProductState.ts";
import {
    mapToInternalUserProductData,
    type UserProductData,
} from "@/data/internal/UserProductData.ts";

export type OverviewProduct = {
    readonly productId: string;
    readonly eventId: string;
    readonly shopId: string;
    readonly shopsProductId: string;
    readonly shopName: string;
    readonly title: string;
    readonly description?: string;
    readonly price?: string;
    readonly state: ProductState;
    readonly url: URL | null;
    readonly images: readonly URL[];
    readonly created: Date;
    readonly updated: Date;
    readonly userData?: UserProductData;
};

function mapProductDataToOverviewProduct(
    productData: GetProductData,
    userData?: ProductUserStateData | null,
): OverviewProduct {
    return {
        productId: productData.productId,
        eventId: productData.eventId,
        shopId: productData.shopId,
        shopsProductId: productData.shopsProductId,
        shopName: productData.shopName,
        title: productData.title.text,
        description: productData.description?.text,
        price: productData.price ? formatPrice(productData.price) : undefined,
        state: parseProductState(productData.state),
        url: URL.parse(productData.url),
        images:
            productData.images == null
                ? []
                : productData.images
                      .filter((url) => URL.canParse(url))
                      .map((url): URL => new URL(url)),
        created: new Date(productData.created),
        updated: new Date(productData.updated),
        userData: userData ? mapToInternalUserProductData(userData) : undefined,
    };
}

export function mapPersonalizedGetProductDataToOverviewProduct(
    apiData: PersonalizedGetProductData,
): OverviewProduct {
    return mapProductDataToOverviewProduct(apiData.item, apiData.userState);
}

export function mapWatchlistProductDataToOverviewProduct(
    apiData: WatchlistProductData,
): OverviewProduct {
    return mapProductDataToOverviewProduct(apiData.product, {
        watchlist: {
            watching: true,
            notifications: apiData.notifications,
        },
    });
}
