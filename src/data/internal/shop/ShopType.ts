import type { ShopTypeData } from "@/client";

export const SHOP_TYPES = [
    "AUCTION_HOUSE",
    "AUCTION_PLATFORM",
    "COMMERCIAL_DEALER",
    "MARKETPLACE",
    "UNKNOWN",
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
    UNKNOWN: {
        translationKey: "shopType.unknown",
    },
} as const;

export function parseShopType(shopType?: string): ShopType {
    const uppercasedShopType = shopType?.toUpperCase() ?? "UNKNOWN";

    switch (uppercasedShopType) {
        case "AUCTION_HOUSE":
        case "AUCTION_PLATFORM":
        case "COMMERCIAL_DEALER":
        case "MARKETPLACE":
            return uppercasedShopType;
        default:
            return "UNKNOWN";
    }
}

export function mapToBackendShopType(shopType?: ShopType): ShopTypeData | undefined {
    if (!shopType) return undefined;

    switch (shopType) {
        case "AUCTION_HOUSE":
        case "AUCTION_PLATFORM":
        case "COMMERCIAL_DEALER":
        case "MARKETPLACE":
            return shopType;
        case "UNKNOWN":
            return undefined;
    }
}
