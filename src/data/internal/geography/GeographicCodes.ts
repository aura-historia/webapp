import {
    ISO_CODES_RELEASE,
    ISO_COUNTRY_CODES,
    ISO_SUBDIVISION_SUFFIXES,
} from "@/data/internal/geography/reference/isoCodes.gen.ts";

/** The only ISO reference release the backend currently interprets codes against. */
export const GEOGRAPHIC_REFERENCE_RELEASE = ISO_CODES_RELEASE;
export type GeographicReferenceRelease = typeof ISO_CODES_RELEASE;

declare const countryCodeBrand: unique symbol;
declare const subdivisionCodeBrand: unique symbol;

/** Current ISO 3166-1 alpha-2 code validated against the pinned release. */
export type CountryCode = string & { readonly [countryCodeBrand]: true };
/** Complete ISO 3166-2 code (`DE-BY`) validated against the pinned release. */
export type SubdivisionCode = string & { readonly [subdivisionCodeBrand]: true };

let countryCodes: ReadonlySet<string> | undefined;
let subdivisionCodes: ReadonlyMap<string, readonly string[]> | undefined;

function getCountryCodes(): ReadonlySet<string> {
    countryCodes ??= new Set(ISO_COUNTRY_CODES);
    return countryCodes;
}

function getSubdivisionCodes(): ReadonlyMap<string, readonly string[]> {
    subdivisionCodes ??= new Map(
        Object.entries(ISO_SUBDIVISION_SUFFIXES).map(([country, suffixes]) => [
            country,
            suffixes.split(" ").map((suffix) => `${country}-${suffix}`),
        ]),
    );
    return subdivisionCodes;
}

export function parseGeographicReferenceRelease(
    value: unknown,
): GeographicReferenceRelease | undefined {
    return value === GEOGRAPHIC_REFERENCE_RELEASE ? GEOGRAPHIC_REFERENCE_RELEASE : undefined;
}

/** Exact uppercase alpha-2 only: no trimming, case folding, alpha-3 or provider aliases. */
export function parseCountryCode(value: unknown): CountryCode | undefined {
    return typeof value === "string" && getCountryCodes().has(value)
        ? (value as CountryCode)
        : undefined;
}

/** Complete code only; a bare suffix such as `BY` is never resolved to a country. */
export function parseSubdivisionCode(value: unknown): SubdivisionCode | undefined {
    if (typeof value !== "string") return undefined;
    return getSubdivisionCodes().get(value.slice(0, 2))?.includes(value)
        ? (value as SubdivisionCode)
        : undefined;
}

export function getSubdivisionCountry(code: SubdivisionCode): CountryCode {
    return code.slice(0, 2) as CountryCode;
}

export function listCountryCodes(): readonly CountryCode[] {
    return ISO_COUNTRY_CODES as readonly CountryCode[];
}

export function listSubdivisionCodes(country: CountryCode): readonly SubdivisionCode[] {
    return (getSubdivisionCodes().get(country) ?? []) as readonly SubdivisionCode[];
}

/**
 * Localized country name from the runtime's locale data, falling back to the code.
 * Pass the route language, never the browser locale, so server and client render alike.
 */
export function formatCountryName(code: CountryCode, language: string): string {
    try {
        return (
            new Intl.DisplayNames([language], { type: "region", fallback: "code" }).of(code) ?? code
        );
    } catch {
        return code;
    }
}
