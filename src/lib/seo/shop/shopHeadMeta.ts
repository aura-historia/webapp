import type { GetShopData } from "@/client";
import { BANNER_IMAGE_URL } from "@/lib/seo/seoConstants.ts";
import { generateHreflangLinks } from "@/lib/seo/hreflangLinks.ts";
import { env } from "@/env.ts";
import i18n from "@/i18n/i18n.ts";

type HeadMeta = {
    meta: Array<
        | { title: string }
        | { name: string; content: string }
        | { property: string; content: string }
    >;
    links: Array<{ rel: string; href: string; hreflang?: string }>;
    scripts: Array<{ type: string; children: string }>;
};

type ShopHeadParams = {
    shopSlugId: string;
};

type PostalAddressJsonLd = {
    "@type": "PostalAddress";
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
};

type GeoCoordinatesJsonLd = {
    "@type": "GeoCoordinates";
    latitude: number;
    longitude: number;
};

type ShopLocalBusinessJsonLd = {
    "@type": "LocalBusiness";
    name: string;
    url?: string;
    image: string;
    address?: PostalAddressJsonLd;
    geo?: GeoCoordinatesJsonLd;
    telephone?: string;
    email?: string;
};

type ShopCollectionPageJsonLd = {
    "@context": "https://schema.org/";
    "@type": "CollectionPage";
    name: string;
    url: string;
    image: string;
    dateCreated: string;
    dateModified: string;
    about?: ShopLocalBusinessJsonLd;
};

function buildStreetAddress(data: GetShopData) {
    return [data.structuredAddress?.addressline, data.structuredAddress?.addresslineExtra]
        .filter(Boolean)
        .join(", ");
}

function generatePostalAddressJsonLd(data: GetShopData): PostalAddressJsonLd | undefined {
    const streetAddress = buildStreetAddress(data);
    const address = {
        "@type": "PostalAddress" as const,
        streetAddress: streetAddress || undefined,
        addressLocality: data.structuredAddress?.locality,
        addressRegion: data.structuredAddress?.region,
        postalCode: data.structuredAddress?.postalCode,
        addressCountry: data.structuredAddress?.country,
    };

    return Object.values(address).some((value) => value && value !== "PostalAddress")
        ? address
        : undefined;
}

function generateShopJsonLd(data: GetShopData, shopUrl: string): ShopCollectionPageJsonLd {
    const address = generatePostalAddressJsonLd(data);
    const geo = data.geoAddress
        ? {
              "@type": "GeoCoordinates" as const,
              latitude: data.geoAddress.lat,
              longitude: data.geoAddress.lon,
          }
        : undefined;
    const about =
        address || geo || data.phone || data.email
            ? {
                  "@type": "LocalBusiness" as const,
                  name: data.name,
                  url: data.url ?? data.viewUrl ?? shopUrl,
                  image: data.image ?? BANNER_IMAGE_URL,
                  address,
                  geo,
                  telephone: data.phone,
                  email: data.email,
              }
            : undefined;

    return {
        "@context": "https://schema.org/",
        "@type": "CollectionPage",
        name: data.name,
        url: shopUrl,
        image: data.image ?? BANNER_IMAGE_URL,
        dateCreated: data.created,
        dateModified: data.updated,
        about,
    };
}

function generateLocationMeta(loaderData: GetShopData | undefined) {
    if (!loaderData?.geoAddress) {
        return [];
    }

    const { lat, lon } = loaderData.geoAddress;
    const placeName = loaderData.structuredAddress?.locality ?? loaderData.name;
    const region = [loaderData.structuredAddress?.country, loaderData.structuredAddress?.region]
        .filter(Boolean)
        .join("-");

    return [
        { name: "geo.position", content: `${lat};${lon}` },
        { name: "ICBM", content: `${lat}, ${lon}` },
        { name: "geo.placename", content: placeName },
        ...(region ? [{ name: "geo.region", content: region }] : []),
    ];
}

/**
 * Generates head metadata (meta tags, Open Graph, Twitter Cards, canonical link, hreflang, and JSON-LD)
 * for a shop detail page using i18n for translations.
 *
 * When `loaderData` is undefined (SSR fallback / error state) sensible defaults are used so
 * the page always emits valid, non-empty meta tags.
 */
export function generateShopHeadMeta(
    loaderData: GetShopData | undefined,
    params: ShopHeadParams,
): HeadMeta {
    const shopUrl = `${env.VITE_APP_URL}/shops/${params.shopSlugId}`;
    const shopPath = `/shops/${params.shopSlugId}`;

    const name = loaderData?.name ?? i18n.t("meta.shop.defaultName");
    const siteName = i18n.t("meta.siteName");
    const description = i18n.t("shop.header.metaDescription", { shop: name });

    return {
        meta: [
            { title: `${name} | ${siteName}` },
            { name: "description", content: description },
            // Open Graph
            { property: "og:title", content: name },
            { property: "og:description", content: description },
            { property: "og:type", content: "website" },
            { property: "og:url", content: shopUrl },
            { property: "og:image", content: loaderData?.image ?? BANNER_IMAGE_URL },
            { property: "og:image:alt", content: name },
            // Twitter Card
            { name: "twitter:card", content: "summary_large_image" },
            { name: "twitter:title", content: name },
            { name: "twitter:description", content: description },
            { name: "twitter:url", content: shopUrl },
            { name: "twitter:image", content: loaderData?.image ?? BANNER_IMAGE_URL },
            { name: "twitter:image:alt", content: name },
            ...generateLocationMeta(loaderData),
        ],
        links: [{ rel: "canonical", href: shopUrl }, ...generateHreflangLinks(shopPath)],
        scripts: loaderData
            ? [
                  {
                      type: "application/ld+json",
                      children: JSON.stringify(generateShopJsonLd(loaderData, shopUrl)),
                  },
              ]
            : [],
    };
}
