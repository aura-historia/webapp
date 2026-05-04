import type { GetShopData } from "@/client";
import { parseShopType, type ShopType } from "@/data/internal/shop/ShopType.ts";
import {
    parseShopPartnerStatus,
    type ShopPartnerStatus,
} from "@/data/internal/shop/ShopPartnerStatus.ts";

export type StructuredAddress = {
    readonly addressline?: string;
    readonly addresslineExtra?: string;
    readonly locality?: string;
    readonly region?: string;
    readonly postalCode?: string;
    readonly country?: string;
    readonly continent?: string;
};

export type GeoAddress = {
    readonly lat: number;
    readonly lon: number;
};

export type ShopDetail = {
    readonly shopId: string;
    readonly shopSlugId: string;
    readonly name: string;
    readonly shopType: ShopType;
    readonly partnerStatus: ShopPartnerStatus;
    readonly image?: string;
    readonly url?: string;
    readonly domains: string[];
    readonly structuredAddress?: StructuredAddress;
    readonly geoAddress?: GeoAddress;
    readonly phone?: string;
    readonly email?: string;
    readonly specialitiesCategories?: string[];
    readonly specialitiesPeriods?: string[];
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
        url: data.url ?? undefined,
        domains: data.domains,
        structuredAddress: data.structuredAddress
            ? {
                  addressline: data.structuredAddress.addressline,
                  addresslineExtra: data.structuredAddress.addresslineExtra,
                  locality: data.structuredAddress.locality,
                  region: data.structuredAddress.region,
                  postalCode: data.structuredAddress.postalCode,
                  country: data.structuredAddress.country,
                  continent: data.structuredAddress.continent,
              }
            : undefined,
        geoAddress: data.geoAddress
            ? { lat: data.geoAddress.lat, lon: data.geoAddress.lon }
            : undefined,
        phone: data.phone,
        email: data.email,
        specialitiesCategories:
            data.specialitiesCategories && data.specialitiesCategories.length > 0
                ? [...data.specialitiesCategories]
                : undefined,
        specialitiesPeriods:
            data.specialitiesPeriods && data.specialitiesPeriods.length > 0
                ? [...data.specialitiesPeriods]
                : undefined,
        created: new Date(data.created),
        updated: new Date(data.updated),
    };
}
