import type {
    PersonalizedGetProductData,
    WatchlistProductData,
    GetProductData,
    ProductUserStateData,
} from "@/client";
import { type ProductState, parseProductState } from "@/data/internal/product/ProductState.ts";
import {
    mapToInternalUserProductData,
    type UserProductData,
} from "@/data/internal/product/UserProductData.ts";
import {
    type Authenticity,
    parseAuthenticity,
} from "@/data/internal/quality-indicators/Authenticity.ts";
import { type Condition, parseCondition } from "@/data/internal/quality-indicators/Condition.ts";
import { type Provenance, parseProvenance } from "@/data/internal/quality-indicators/Provenance.ts";
import {
    type Restoration,
    parseRestoration,
} from "@/data/internal/quality-indicators/Restoration.ts";
import {
    mapToInternalProductImage,
    type ProductImage,
} from "@/data/internal/product/ProductImageData.ts";
import { parseShopType, type ShopType } from "@/data/internal/shop/ShopType.ts";
import {
    parsePriceEstimate,
    type PriceEstimate,
} from "@/data/internal/quality-indicators/PriceEstimate.ts";
import { formatPrice } from "@/data/internal/price/Price.ts";

export type OverviewProduct = {
    readonly productId: string;
    readonly eventId: string;
    readonly shopId: string;
    readonly shopsProductId: string;
    readonly shopName: string;
    readonly title: string;
    readonly description?: string;
    readonly price?: string;
    readonly priceEstimate?: PriceEstimate;
    readonly state: ProductState;
    readonly url: URL | null;
    readonly images: readonly ProductImage[];
    readonly created: Date;
    readonly updated: Date;
    readonly userData?: UserProductData;
    readonly shopType: ShopType;

    readonly originYear?: number;
    readonly originYearMin?: number;
    readonly originYearMax?: number;
    readonly authenticity: Authenticity;
    readonly condition: Condition;
    readonly provenance: Provenance;
    readonly restoration: Restoration;
};

function mapProductDataToOverviewProduct(
    productData: GetProductData,
    locale: string,
    userData?: ProductUserStateData | null,
): OverviewProduct {
    return {
        productId: productData.productId,
        eventId: productData.eventId,
        shopId: productData.shopId,
        shopsProductId: productData.shopsProductId,
        shopName: productData.shopName,
        shopType: parseShopType(productData.shopType),
        title: productData.title.text,
        description: productData.description?.text,
        price: productData.price ? formatPrice(productData.price, locale) : undefined,
        priceEstimate: parsePriceEstimate(
            productData.priceEstimateMin ?? undefined,
            productData.priceEstimateMax ?? undefined,
            locale,
        ),
        state: parseProductState(productData.state),
        url: URL.parse(productData.url),
        images:
            productData.images == null
                ? []
                : productData.images
                      .map(mapToInternalProductImage)
                      .filter((image) => image !== undefined),
        created: new Date(productData.created),
        updated: new Date(productData.updated),
        userData: userData ? mapToInternalUserProductData(userData) : undefined,

        originYear: productData.originYear ?? undefined,
        originYearMin: productData.originYearMin ?? undefined,
        originYearMax: productData.originYearMax ?? undefined,
        authenticity: parseAuthenticity(productData.authenticity),
        condition: parseCondition(productData.condition),
        provenance: parseProvenance(productData.provenance),
        restoration: parseRestoration(productData.restoration),
    };
}

export function mapPersonalizedGetProductDataToOverviewProduct(
    apiData: PersonalizedGetProductData,
    locale: string,
): OverviewProduct {
    return mapProductDataToOverviewProduct(apiData.item, locale, apiData.userState);
}

export function mapWatchlistProductDataToOverviewProduct(
    apiData: WatchlistProductData,
    locale: string,
): OverviewProduct {
    return mapProductDataToOverviewProduct(apiData.product, locale, {
        watchlist: {
            watching: true,
            notifications: apiData.notifications,
        },
    });
}
