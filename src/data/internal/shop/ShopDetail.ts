import type { GetShopData } from "@/client";
import { parseShopType, type ShopType } from "@/data/internal/shop/ShopType.ts";
import {
    parseShopPartnerStatus,
    type ShopPartnerStatus,
} from "@/data/internal/shop/ShopPartnerStatus.ts";

export type ShopDetail = {
    readonly shopId: string;
    readonly shopSlugId: string;
    readonly name: string;
    readonly shopType: ShopType;
    readonly partnerStatus: ShopPartnerStatus;
    readonly image?: string;
    readonly domains: string[];
    readonly url?: string;
    readonly created: Date;
    readonly updated: Date;
};

/**
 * Maps the raw API response for a shop detail to the internal {@link ShopDetail} domain type.
 * Parses RFC3339 date strings into {@link Date} objects and normalises the shop type.
 */
export function mapToShopDetail(data: GetShopData): ShopDetail {
    return {
        shopId: data.shopId,
        shopSlugId: data.shopSlugId,
        name: data.name,
        shopType: parseShopType(data.shopType),
        partnerStatus: parseShopPartnerStatus(data.partnerStatus),
        image: data.image ?? undefined,
        domains: data.domains,
        url: data.url ?? undefined,
        created: new Date(data.created),
        updated: new Date(data.updated),
    };
}
