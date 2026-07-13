import { H2 } from "@/components/typography/H2.tsx";

import type { GeoAddress, ShopDetail, StructuredAddress } from "@/data/internal/shop/ShopDetail.ts";
import { SHOP_TYPE_TRANSLATION_CONFIG } from "@/data/internal/shop/ShopType.ts";
import { Mail, MapPin, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";

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

function getMapLocale(language: string) {
    return language.split("-")[0] || "en";
}

function buildMapEmbedUrl(
    geoAddress: GeoAddress | undefined,
    textualAddress: string,
    language: string,
) {
    const locale = getMapLocale(language);

    if (geoAddress) {
        const params = new URLSearchParams({
            hl: locale,
            output: "embed",
            q: `${geoAddress.lat},${geoAddress.lon}`,
            z: "16",
        });

        return `https://www.google.com/maps?${params.toString()}`;
    }

    if (textualAddress) {
        const params = new URLSearchParams({
            hl: locale,
            output: "embed",
            q: textualAddress,
        });

        return `https://www.google.com/maps?${params.toString()}`;
    }

    return undefined;
}

function buildPhoneHref(phone: string) {
    return `tel:${phone.replace(/(?!^)\+|[^\d+]/g, "")}`;
}

export function ShopLocationSection({ shop }: ShopLocationSectionProps) {
    const { t, i18n } = useTranslation();
    const addressLines = buildAddressLines(shop.structuredAddress, i18n.language);
    const textualAddress = buildTextualAddress(shop.structuredAddress, i18n.language);
    const mapEmbedUrl = buildMapEmbedUrl(shop.geoAddress, textualAddress, i18n.language);

    const shopTypeName = shop.shopType
        ? t(SHOP_TYPE_TRANSLATION_CONFIG[shop.shopType].translationKey)
        : t("shop.typeFallback");
    const shopTypeArticle = shop.shopType
        ? t(SHOP_TYPE_TRANSLATION_CONFIG[shop.shopType].articleTranslationKey)
        : t("shop.typeArticleFallback");
    const hasContactInformation = Boolean(shop.email || shop.phone);

    return (
        <section className="mx-auto w-full max-w-7xl px-4 pb-14 md:px-10 md:pb-18">
            <div className="grid gap-6 bg-surface-container-low p-4 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-8 md:p-8">
                <div className="flex flex-col justify-between gap-8 bg-surface-container-lowest p-6 md:p-8">
                    <div className="space-y-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-tertiary">
                            {t("shop.location.eyebrow")}
                        </p>
                        <H2 className="text-3xl font-normal italic leading-tight md:text-4xl">
                            {t("shop.location.title", { shopTypeArticle })}
                        </H2>
                        <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                            {t("shop.location.description", {
                                shop: shop.name,
                                shopType: shopTypeName,
                            })}
                        </p>
                    </div>

                    <div className="space-y-5">
                        {addressLines.length > 0 ? (
                            <address className="space-y-1 font-sans text-base not-italic leading-7 text-on-surface">
                                {addressLines.map((line) => (
                                    <span
                                        key={line.id}
                                        className={
                                            line.id === "country"
                                                ? "mt-4 inline-flex bg-tertiary-fixed px-3 py-1 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-primary"
                                                : "block"
                                        }
                                    >
                                        {line.value}
                                    </span>
                                ))}
                            </address>
                        ) : (
                            <div className="bg-surface-container-high p-5 text-sm leading-6 text-muted-foreground">
                                {t("shop.location.noAddress", { shopTypeArticle })}
                            </div>
                        )}

                        {hasContactInformation && (
                            <div className="bg-surface-container-low p-5">
                                <p className="text-xs uppercase tracking-[0.18em] text-tertiary">
                                    {t("shop.contact.eyebrow")}
                                </p>
                                <div className="mt-4 space-y-3">
                                    {shop.email && (
                                        <a
                                            href={`mailto:${shop.email}`}
                                            className="flex min-h-11 items-center gap-3 font-sans text-sm text-primary transition-colors duration-300 ease-out hover:underline"
                                        >
                                            <Mail className="size-4 shrink-0" aria-hidden="true" />
                                            <span className="sr-only">
                                                {t("shop.contact.email")}:{" "}
                                            </span>
                                            <span>{shop.email}</span>
                                        </a>
                                    )}
                                    {shop.phone && (
                                        <a
                                            href={buildPhoneHref(shop.phone)}
                                            className="flex min-h-11 items-center gap-3 font-sans text-sm text-primary transition-colors duration-300 ease-out hover:underline"
                                        >
                                            <Phone className="size-4 shrink-0" aria-hidden="true" />
                                            <span className="sr-only">
                                                {t("shop.contact.phone")}:{" "}
                                            </span>
                                            <span>{shop.phone}</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
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
                        </div>
                    ) : (
                        <div className="flex h-full min-h-76 flex-col items-center justify-center gap-4 bg-surface-container-lowest p-8 text-center md:min-h-106">
                            <MapPin className="size-10 text-tertiary" aria-hidden="true" />
                            <p className="max-w-md font-display text-2xl italic text-primary">
                                {t("shop.location.noLocation", { shopTypeArticle })}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
