export const SHOP_TYPES = ["AUCTION_HOUSE", "COMMERCIAL_DEALER", "MARKETPLACE", "UNKNOWN"] as const;

export type ShopType = (typeof SHOP_TYPES)[number];

// FE accepts UNKNOWN (because of the mapper), but BE dont accepts (and didnt know) UNKNOWN
export type BackendShopType = Exclude<ShopType, "UNKNOWN">;

export const SHOP_TYPE_TRANSLATION_CONFIG = {
    AUCTION_HOUSE: {
        translationKey: "shopType.auctionHouse",
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
        case "COMMERCIAL_DEALER":
        case "MARKETPLACE":
            return uppercasedShopType;
        default:
            return "UNKNOWN";
    }
}

export function mapToBackendShopType(shopType?: ShopType): BackendShopType | undefined {
    if (!shopType) return undefined;

    switch (shopType) {
        case "AUCTION_HOUSE":
        case "COMMERCIAL_DEALER":
        case "MARKETPLACE":
            return shopType;
        case "UNKNOWN":
            return undefined;
    }
}
