import type { GeoAddress, StructuredAddress } from "@/data/internal/shop/ShopDetail.ts";

export type AddressLine = {
    readonly id: string;
    readonly value: string;
};

export function hasAddressValue(address?: StructuredAddress): address is StructuredAddress {
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

export function formatCountry(country: string | undefined, language: string) {
    if (!country) {
        return undefined;
    }

    try {
        return new Intl.DisplayNames([language], { type: "region" }).of(country) ?? country;
    } catch {
        return country;
    }
}

export function buildAddressLines(
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

export function buildTextualAddress(address: StructuredAddress | undefined, language: string) {
    return buildAddressLines(address, language)
        .map((line) => line.value)
        .join(", ");
}

export function getMapLocale(language: string) {
    return language.split("-")[0] || "en";
}

export function buildMapEmbedUrl(
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
            z: "14",
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

export function buildPhoneHref(phone: string) {
    return `tel:${phone.replace(/(?!^)\+|[^\d+]/g, "")}`;
}
