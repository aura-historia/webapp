import { H2 } from "@/components/typography/H2.tsx";
import { Button } from "@/components/ui/button.tsx";
import type { GeoAddress, ShopDetail, StructuredAddress } from "@/data/internal/shop/ShopDetail.ts";
import { SHOP_TYPE_TRANSLATION_CONFIG } from "@/data/internal/shop/ShopType.ts";
import { ArrowUpRight, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";

const MAP_DELTA = 0.01;

type ShopLocationSectionProps = {
    readonly shop: ShopDetail;
};

type AddressLine = {
    readonly id: string;
    readonly value: string;
};

function hasAddressValue(address?: StructuredAddress): address is StructuredAddress {
    if (!address) {
        return false;
    }

    return [
        address.addressline,
        address.addresslineExtra,
        address.locality,
        address.region,
        address.postalCode,
        address.country,
    ].some(Boolean);
}

function formatCountry(country: string | undefined, language: string) {
    if (!country) {
        return undefined;
    }

    try {
        return new Intl.DisplayNames([language], { type: "region" }).of(country) ?? country;
    } catch {
        return country;
    }
}

function buildAddressLines(
    address: StructuredAddress | undefined,
    language: string,
): AddressLine[] {
    if (!hasAddressValue(address)) {
        return [];
    }

    const localityLine = [address.postalCode, address.locality].filter(Boolean).join(" ");
    const country = formatCountry(address.country, language);

    return [
        { id: "addressline", value: address.addressline },
        { id: "addressline-extra", value: address.addresslineExtra },
        { id: "locality", value: localityLine },
        { id: "region", value: address.region },
        { id: "country", value: country },
    ].filter((line): line is AddressLine => Boolean(line.value));
}

function buildTextualAddress(address: StructuredAddress | undefined, language: string) {
    return buildAddressLines(address, language)
        .map((line) => line.value)
        .join(", ");
}

function buildMapEmbedUrl(geoAddress: GeoAddress | undefined, textualAddress: string) {
    if (geoAddress) {
        const { lat, lon } = geoAddress;
        const bbox = [lon - MAP_DELTA, lat - MAP_DELTA, lon + MAP_DELTA, lat + MAP_DELTA].join(",");
        const params = new URLSearchParams({
            bbox,
            layer: "mapnik",
            marker: `${lat},${lon}`,
        });

        return `https://www.openstreetmap.org/export/embed.html?${params.toString()}`;
    }

    if (textualAddress) {
        const params = new URLSearchParams({
            q: textualAddress,
            output: "embed",
        });

        return `https://www.google.com/maps?${params.toString()}`;
    }

    return undefined;
}

function buildMapExternalUrl(geoAddress: GeoAddress | undefined, textualAddress: string) {
    if (geoAddress) {
        const params = new URLSearchParams({
            mlat: String(geoAddress.lat),
            mlon: String(geoAddress.lon),
        });

        return `https://www.openstreetmap.org/?${params.toString()}#map=16/${geoAddress.lat}/${geoAddress.lon}`;
    }

    if (textualAddress) {
        const params = new URLSearchParams({ q: textualAddress });

        return `https://www.google.com/maps/search/?api=1&${params.toString()}`;
    }

    return undefined;
}

export function ShopLocationSection({ shop }: ShopLocationSectionProps) {
    const { t, i18n } = useTranslation();
    const addressLines = buildAddressLines(shop.structuredAddress, i18n.language);
    const textualAddress = buildTextualAddress(shop.structuredAddress, i18n.language);
    const mapEmbedUrl = buildMapEmbedUrl(shop.geoAddress, textualAddress);
    const mapExternalUrl = buildMapExternalUrl(shop.geoAddress, textualAddress);
    const shopTypeName = shop.shopType
        ? t(SHOP_TYPE_TRANSLATION_CONFIG[shop.shopType].translationKey)
        : t("shop.location.shopFallbackType");

    return (
        <section className="mx-auto w-full max-w-7xl px-4 pb-14 md:px-10 md:pb-18">
            <div className="grid gap-6 bg-surface-container-low p-4 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-8 md:p-8">
                <div className="flex flex-col justify-between gap-8 bg-surface-container-lowest p-6 md:p-8">
                    <div className="space-y-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-tertiary">
                            {t("shop.location.eyebrow")}
                        </p>
                        <H2 className="text-3xl font-normal italic leading-tight md:text-4xl">
                            {t("shop.location.title")}
                        </H2>
                        <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                            {t("shop.location.description", { shop: shop.name })}
                        </p>
                    </div>

                    {addressLines.length > 0 ? (
                        <address className="space-y-1 font-sans text-base not-italic leading-7 text-on-surface">
                            {addressLines.map((line) => (
                                <span key={line.id} className="block">
                                    {line.value}
                                </span>
                            ))}
                        </address>
                    ) : (
                        <div className="bg-surface-container-high p-5 text-sm leading-6 text-muted-foreground">
                            {t("shop.location.noAddress", { shopType: shopTypeName })}
                        </div>
                    )}

                    {shop.geoAddress && (
                        <dl className="grid grid-cols-2 gap-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                            <div className="bg-surface-container-low p-3">
                                <dt>{t("shop.location.latitude")}</dt>
                                <dd className="mt-1 font-sans text-sm tracking-normal text-on-surface">
                                    {shop.geoAddress.lat.toFixed(5)}
                                </dd>
                            </div>
                            <div className="bg-surface-container-low p-3">
                                <dt>{t("shop.location.longitude")}</dt>
                                <dd className="mt-1 font-sans text-sm tracking-normal text-on-surface">
                                    {shop.geoAddress.lon.toFixed(5)}
                                </dd>
                            </div>
                        </dl>
                    )}
                </div>

                <div className="min-h-80 bg-surface-container-high p-2 md:min-h-110">
                    {mapEmbedUrl ? (
                        <div className="relative h-full min-h-76 overflow-hidden bg-surface-container-highest">
                            <iframe
                                title={t("shop.location.mapTitle", { shop: shop.name })}
                                src={mapEmbedUrl}
                                className="h-full min-h-76 w-full md:min-h-106"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                allowFullScreen
                            />
                            {mapExternalUrl && (
                                <Button
                                    asChild
                                    variant="secondary"
                                    className="absolute bottom-4 left-4 h-11 rounded-none bg-surface/80 px-4 text-xs uppercase tracking-[0.12em] text-primary backdrop-blur-xl hover:bg-surface"
                                >
                                    <a
                                        href={mapExternalUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <ArrowUpRight className="size-4" />
                                        <span>{t("shop.location.openMap")}</span>
                                    </a>
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="flex h-full min-h-76 flex-col items-center justify-center gap-4 bg-surface-container-lowest p-8 text-center md:min-h-106">
                            <MapPin className="size-10 text-tertiary" aria-hidden="true" />
                            <p className="max-w-md font-display text-2xl italic text-primary">
                                {t("shop.location.noLocation", { shopType: shopTypeName })}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
