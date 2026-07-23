import type {
    CurrencyData,
    GeoAddressData,
    GetShopData,
    LanguageData,
    StructuredAddressData,
} from "@/client";
import { parseShopType, type ShopType } from "@/data/internal/shop/ShopType.ts";
import {
    parseShopPartnerStatus,
    type ShopPartnerStatus,
} from "@/data/internal/shop/ShopPartnerStatus.ts";

export type StructuredAddress = StructuredAddressData;

export type GeoAddress = GeoAddressData;

export function mapStructuredAddress(
    data: StructuredAddressData | null | undefined,
): StructuredAddress | undefined {
    return data
        ? {
              addressline: data.addressline,
              addresslineExtra: data.addresslineExtra,
              locality: data.locality,
              region: data.region,
              postalCode: data.postalCode,
              country: data.country,
              continent: data.continent,
          }
        : undefined;
}

export function mapGeoAddress(data: GeoAddressData | null | undefined): GeoAddress | undefined {
    return data ? { lat: data.lat, lon: data.lon } : undefined;
}

export type ShopDetail = {
    readonly shopId: string;
    readonly shopSlugId: string;
    readonly name: string;
    readonly shopType?: ShopType;
    readonly partnerStatus: ShopPartnerStatus;
    readonly image?: string;
    readonly url?: string;
    readonly viewUrl?: string;
    readonly domains: string[];
    readonly shopifyDomain?: string;
    readonly shopifyCurrency?: CurrencyData;
    readonly shopifyLanguage?: LanguageData;
    readonly woocommerceCurrency?: CurrencyData;
    readonly woocommerceLanguage?: LanguageData;
    readonly structuredAddress?: StructuredAddress;
    readonly geoAddress?: GeoAddress;
    readonly phone?: string;
    readonly email?: string;
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
        viewUrl: data.viewUrl ?? undefined,
        domains: data.domains,
        shopifyDomain: data.shopifyDomain ?? undefined,
        shopifyCurrency: data.shopifyCurrency ?? undefined,
        shopifyLanguage: data.shopifyLanguage ?? undefined,
        woocommerceCurrency: data.woocommerceCurrency ?? undefined,
        woocommerceLanguage: data.woocommerceLanguage ?? undefined,
        structuredAddress: mapStructuredAddress(data.structuredAddress),
        geoAddress: mapGeoAddress(data.geoAddress),
        phone: data.phone,
        email: data.email,
        created: new Date(data.created),
        updated: new Date(data.updated),
    };
}
