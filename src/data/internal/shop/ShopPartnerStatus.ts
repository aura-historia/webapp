import type { ShopPartnerStatusData } from "@/client";

export const SHOP_PARTNER_STATUSES = ["PARTNERED", "SCRAPED"] as const;

export type ShopPartnerStatus = (typeof SHOP_PARTNER_STATUSES)[number];

export const SHOP_PARTNER_STATUS_TRANSLATION_CONFIG = {
    PARTNERED: {
        translationKey: "shopPartnerStatus.partnered",
    },
    SCRAPED: {
        translationKey: "shopPartnerStatus.scraped",
    },
} as const;

export function parseShopPartnerStatus(status?: string): ShopPartnerStatus {
    const upper = status?.toUpperCase() ?? "SCRAPED";
    switch (upper) {
        case "PARTNERED":
            return "PARTNERED";
        default:
            return "SCRAPED";
    }
}

export function mapToBackendShopPartnerStatus(status: ShopPartnerStatus): ShopPartnerStatusData {
    return status;
}
