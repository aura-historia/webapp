import type { ShopTypeData } from "@/client";

export const SHOP_TYPES = [
    "AUCTION_HOUSE",
    "AUCTION_PLATFORM",
    "COMMERCIAL_DEALER",
    "MARKETPLACE",
] as const;

export type ShopType = (typeof SHOP_TYPES)[number];

export const SHOP_TYPE_TRANSLATION_CONFIG = {
    AUCTION_HOUSE: {
        translationKey: "shopType.auctionHouse",
    },
    AUCTION_PLATFORM: {
        translationKey: "shopType.auctionPlatform",
    },
    COMMERCIAL_DEALER: {
        translationKey: "shopType.commercialDealer",
    },
    MARKETPLACE: {
        translationKey: "shopType.marketplace",
    },
} as const;

export function parseShopType(shopType?: string): ShopType | undefined {
    const uppercasedShopType = shopType?.toUpperCase();

    switch (uppercasedShopType) {
        case "AUCTION_HOUSE":
        case "AUCTION_PLATFORM":
        case "COMMERCIAL_DEALER":
        case "MARKETPLACE":
            return uppercasedShopType;
        default:
            return undefined;
    }
}

export function mapToBackendShopType(shopType?: ShopType): ShopTypeData | undefined {
    return shopType;
}
