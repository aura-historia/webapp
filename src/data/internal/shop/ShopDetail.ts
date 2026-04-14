import type { GetShopData } from "@/client";
import { parseShopType, type ShopType } from "@/data/internal/shop/ShopType.ts";

export type ShopDetail = {
    readonly shopId: string;
    readonly shopSlugId: string;
    readonly name: string;
    readonly shopType: ShopType;
    readonly image: string | null;
    readonly domains: string[];
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
        image: data.image ?? null,
        domains: data.domains,
        created: new Date(data.created),
        updated: new Date(data.updated),
    };
}
