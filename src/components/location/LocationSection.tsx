import { H2 } from "@/components/typography/H2.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useUserPreferences } from "@/hooks/preferences/useUserPreferences.tsx";
import type { GeoAddress, StructuredAddress } from "@/data/internal/shop/ShopDetail.ts";
import { Mail, MapPin, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";

type LocationContact = {
    readonly eyebrow: string;
    readonly emailLabel: string;
    readonly phoneLabel: string;
    readonly email?: string;
    readonly phone?: string;
};

type LocationTexts = {
    readonly eyebrow: string;
    readonly title: string;
    readonly description: string;
    readonly noAddress: string;
    readonly noLocation: string;
    readonly mapTitle: string;
    readonly mapConsentTitle: string;
    readonly mapConsentDescription: string;
    readonly mapConsentButton: string;
    readonly mapConsentSettings: string;
};

type LocationSectionProps = {
    readonly className: string;
    readonly texts: LocationTexts;
    readonly structuredAddress?: StructuredAddress;
    readonly geoAddress?: GeoAddress;
    readonly contact?: LocationContact;
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

function buildPhoneHref(phone: string) {
    return `tel:${phone.replace(/(?!^)\+|[^\d+]/g, "")}`;
}

/**
 * Generic address + consent-gated Google Maps embed section. Every displayed string is
 * pre-resolved by the caller so this component stays agnostic of which entity (shop, product, ...)
 * the location belongs to.
 */
export function LocationSection({
    className,
    texts,
    structuredAddress,
    geoAddress,
    contact,
}: LocationSectionProps) {
    const {
        eyebrow,
        title,
        description,
        noAddress,
        noLocation,
        mapTitle,
        mapConsentTitle,
        mapConsentDescription,
        mapConsentButton,
        mapConsentSettings,
    } = texts;
    const { i18n } = useTranslation();
    const { preferences, updatePreferences } = useUserPreferences();
    const addressLines = buildAddressLines(structuredAddress, i18n.language);
    const textualAddress = buildTextualAddress(structuredAddress, i18n.language);
    const mapEmbedUrl = buildMapEmbedUrl(geoAddress, textualAddress, i18n.language);

    const hasContactInformation = Boolean(contact?.email || contact?.phone);
    const canLoadMap = preferences.externalMapConsent === true;

    const handleAllowMap = () => {
        updatePreferences({ externalMapConsent: true });
    };

    const mapContent = (() => {
        if (mapEmbedUrl && canLoadMap) {
            return (
                <div className="relative h-full min-h-76 overflow-hidden bg-surface-container-highest">
                    <iframe
                        title={mapTitle}
                        src={mapEmbedUrl}
                        className="h-full min-h-76 w-full md:min-h-106"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        allowFullScreen
                    />
                </div>
            );
        }

        if (mapEmbedUrl) {
            return (
                <div className="flex h-full min-h-76 flex-col items-center justify-center gap-5 bg-surface-container-lowest p-8 text-center md:min-h-106">
                    <MapPin className="size-10 text-tertiary" aria-hidden="true" />
                    <div className="max-w-lg space-y-3">
                        <p className="font-display text-2xl italic text-primary">
                            {mapConsentTitle}
                        </p>
                        <p className="text-sm leading-6 text-muted-foreground">
                            {mapConsentDescription}
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-3 sm:flex-row">
                        <Button
                            type="button"
                            onClick={handleAllowMap}
                            className="h-11 rounded-none text-xs uppercase tracking-[0.12em]"
                        >
                            {mapConsentButton}
                        </Button>
                        <a
                            href="/consent-settings"
                            className="min-h-11 px-2 pt-3 text-xs uppercase tracking-[0.12em] text-primary underline-offset-4 hover:underline"
                        >
                            {mapConsentSettings}
                        </a>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex h-full min-h-76 flex-col items-center justify-center gap-4 bg-surface-container-lowest p-8 text-center md:min-h-106">
                <MapPin className="size-10 text-tertiary" aria-hidden="true" />
                <p className="max-w-md font-display text-2xl italic text-primary">{noLocation}</p>
            </div>
        );
    })();

    return (
        <section className={className}>
            <div className="grid gap-6 bg-surface-container-low p-4 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-8 md:p-8">
                <div className="flex flex-col justify-between gap-8 bg-surface-container-lowest p-6 md:p-8">
                    <div className="space-y-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
                        <H2 className="text-3xl font-normal italic leading-tight md:text-4xl">
                            {title}
                        </H2>
                        <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                            {description}
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
                                {noAddress}
                            </div>
                        )}

                        {hasContactInformation && contact && (
                            <div className="bg-surface-container-low p-5">
                                <p className="text-xs uppercase tracking-[0.18em] text-primary">
                                    {contact.eyebrow}
                                </p>
                                <div className="mt-4 space-y-3">
                                    {contact.email && (
                                        <a
                                            href={`mailto:${contact.email}`}
                                            className="flex min-h-11 items-center gap-3 font-sans text-sm text-primary transition-colors duration-300 ease-out hover:underline"
                                        >
                                            <Mail className="size-4 shrink-0" aria-hidden="true" />
                                            <span className="sr-only">{contact.emailLabel}: </span>
                                            <span>{contact.email}</span>
                                        </a>
                                    )}
                                    {contact.phone && (
                                        <a
                                            href={buildPhoneHref(contact.phone)}
                                            className="flex min-h-11 items-center gap-3 font-sans text-sm text-primary transition-colors duration-300 ease-out hover:underline"
                                        >
                                            <Phone className="size-4 shrink-0" aria-hidden="true" />
                                            <span className="sr-only">{contact.phoneLabel}: </span>
                                            <span>{contact.phone}</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="min-h-80 bg-surface-container-high p-2 md:min-h-110">
                    {mapContent}
                </div>
            </div>
        </section>
    );
}
