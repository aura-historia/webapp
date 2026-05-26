import type {
    PersonalizedGetProductData,
    PersonalizedGetProductSummaryData,
    GetProductData,
    GetProductSummaryData,
    ProductUserStateData,
} from "@/client";
import { type ProductState, parseProductState } from "@/data/internal/product/ProductState.ts";
import {
    mapToInternalUserProductData,
    type UserProductData,
} from "@/data/internal/product/UserProductData.ts";
import {
    mapToInternalProductImage,
    sortImagesRestrictedLast,
    type ProductImage,
} from "@/data/internal/product/ProductImageData.ts";
import { parseShopType, type ShopType } from "@/data/internal/shop/ShopType.ts";
import {
    mapToInternalAuctionWindow,
    type AuctionWindow,
} from "@/data/internal/product/AuctionWindow.ts";
import {
    parsePriceEstimate,
    type PriceEstimate,
} from "@/data/internal/quality-indicators/PriceEstimate.ts";
import { formatPrice } from "@/data/internal/price/Price.ts";

export type OverviewProduct = {
    readonly productId: string;
    readonly productSlugId: string;
    readonly eventId: string;
    readonly shopId: string;
    readonly shopSlugId: string;
    readonly shopsProductId: string;
    readonly shopName: string;
    readonly sellerName: string;
    readonly title: string;
    readonly price?: string;
    readonly priceEstimate?: PriceEstimate;
    readonly state: ProductState;
    readonly url: URL | null;
    readonly viewUrl?: URL | null;
    readonly images: readonly ProductImage[];
    readonly created: Date;
    readonly updated: Date;
    readonly userData?: UserProductData;
    readonly shopType: ShopType;
    readonly auction?: AuctionWindow;
};

function mapProductDataToOverviewProduct(
    productData: GetProductData,
    locale: string,
    userData?: ProductUserStateData | null,
): OverviewProduct {
    return {
        productId: productData.productId,
        productSlugId: productData.productSlugId,
        eventId: productData.eventId,
        shopId: productData.shopId,
        shopSlugId: productData.shopSlugId,
        shopsProductId: productData.shopsProductId,
        shopName: productData.shopName,
        sellerName: productData.sellerName,
        shopType: parseShopType(productData.shopType),
        auction: productData.auction ? mapToInternalAuctionWindow(productData.auction) : undefined,
        title: productData.title.text,
        price: productData.price?.offer ? formatPrice(productData.price.offer, locale) : undefined,
        priceEstimate: parsePriceEstimate(
            productData.price?.estimate?.min ?? undefined,
            productData.price?.estimate?.max ?? undefined,
            locale,
        ),
        state: parseProductState(productData.state),
        url: URL.parse(productData.url),
        viewUrl: URL.parse(productData.viewUrl),
        images: sortImagesRestrictedLast(
            productData.images == null
                ? []
                : productData.images
                      .map(mapToInternalProductImage)
                      .filter((image) => image !== undefined),
            userData?.prohibitedContent?.consent ?? false,
        ),
        created: new Date(productData.created),
        updated: new Date(productData.updated),
        userData: userData ? mapToInternalUserProductData(userData) : undefined,
    };
}

function mapProductSummaryDataToOverviewProduct(
    productData: GetProductSummaryData,
    locale: string,
    userData?: ProductUserStateData | null,
): OverviewProduct {
    return {
        productId: productData.productId,
        productSlugId: productData.productSlugId,
        eventId: productData.eventId,
        shopId: productData.shopId,
        shopSlugId: productData.shopSlugId,
        shopsProductId: productData.shopsProductId,
        shopName: productData.shopName,
        sellerName: productData.sellerName,
        shopType: parseShopType(productData.shopType),
        auction: productData.auction ? mapToInternalAuctionWindow(productData.auction) : undefined,
        title: productData.title.text,
        price: productData.price ? formatPrice(productData.price, locale) : undefined,
        state: parseProductState(productData.state),
        url: URL.parse(productData.url),
        viewUrl: URL.parse(productData.viewUrl),
        images: sortImagesRestrictedLast(
            productData.images == null
                ? []
                : productData.images
                      .map(mapToInternalProductImage)
                      .filter((image) => image !== undefined),
            userData?.prohibitedContent.consent ?? false,
        ),
        created: new Date(productData.created),
        updated: new Date(productData.updated),
        userData: userData ? mapToInternalUserProductData(userData) : undefined,
    };
}

export function mapPersonalizedGetProductDataToOverviewProduct(
    apiData: PersonalizedGetProductData,
    locale: string,
): OverviewProduct {
    return mapProductDataToOverviewProduct(apiData.item, locale, apiData.userState);
}

export function mapPersonalizedGetProductSummaryDataToOverviewProduct(
    apiData: PersonalizedGetProductSummaryData,
    locale: string,
): OverviewProduct {
    return mapProductSummaryDataToOverviewProduct(apiData.item, locale, apiData.userState);
}
