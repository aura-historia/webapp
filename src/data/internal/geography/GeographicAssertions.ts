import type { PartyLocationGeography } from "@/client";
import {
    GEOGRAPHIC_REFERENCE_RELEASE,
    getSubdivisionCountry,
    parseCountryCode,
    parseGeographicReferenceRelease,
    parseSubdivisionCode,
    type CountryCode,
    type GeographicReferenceRelease,
    type SubdivisionCode,
} from "@/data/internal/geography/GeographicCodes.ts";

/**
 * Partial, verbatim geographic assertions made by a caller (or, separately, derived by a provider).
 * Missing facts stay absent. Text keeps its original spelling, spacing and leading zeros.
 */
export type GeographicAssertions = {
    /** Absent when the backend used a release this app cannot interpret; codes are then omitted. */
    readonly referenceRelease?: GeographicReferenceRelease;
    readonly addressText?: string;
    readonly country?: CountryCode;
    readonly subdivision?: SubdivisionCode;
    readonly postalCode?: string;
    /**
     * A returned release or code was not recognized and has been omitted. Never round-trip such a
     * value through a replacing write; the omission would erase the stored assertion.
     */
    readonly hasUnsupportedValues: boolean;
};

/** Caller input for a replacing write. Empty optional values must be omitted, not blank. */
export type GeographicAssertionsInput = {
    readonly addressText?: string;
    readonly country?: CountryCode;
    readonly subdivision?: SubdivisionCode;
    readonly postalCode?: string;
};

export const MAX_ADDRESS_TEXT_BYTES = 4096;
export const MAX_POSTAL_CODE_BYTES = 64;

export type GeographicAssertionsValidationError =
    | "EMPTY"
    | "ADDRESS_TEXT_INVALID"
    | "POSTAL_CODE_INVALID"
    | "COUNTRY_INVALID"
    | "SUBDIVISION_INVALID"
    | "SUBDIVISION_COUNTRY_MISMATCH";

export function mapToGeographicAssertions(
    data: PartyLocationGeography | null | undefined,
): GeographicAssertions | undefined {
    if (!data) return undefined;

    const referenceRelease = parseGeographicReferenceRelease(data.referenceRelease);
    const country = referenceRelease ? parseCountryCode(data.country) : undefined;
    const subdivision = referenceRelease ? parseSubdivisionCode(data.subdivision) : undefined;
    const subdivisionMatches =
        !subdivision || !country || getSubdivisionCountry(subdivision) === country;
    const hasUnsupportedValues =
        !referenceRelease ||
        (data.country != null && !country) ||
        (data.subdivision != null && !subdivision) ||
        !subdivisionMatches;

    return {
        ...(referenceRelease ? { referenceRelease } : {}),
        ...(data.addressText != null ? { addressText: data.addressText } : {}),
        ...(country ? { country } : {}),
        ...(subdivision && subdivisionMatches ? { subdivision } : {}),
        ...(data.postalCode != null ? { postalCode: data.postalCode } : {}),
        hasUnsupportedValues,
    };
}

export function mapToBackendGeographicAssertions(
    input: GeographicAssertionsInput,
): PartyLocationGeography {
    return {
        referenceRelease: GEOGRAPHIC_REFERENCE_RELEASE,
        ...(input.addressText === undefined ? {} : { addressText: input.addressText }),
        ...(input.country === undefined ? {} : { country: input.country }),
        ...(input.subdivision === undefined ? {} : { subdivision: input.subdivision }),
        ...(input.postalCode === undefined ? {} : { postalCode: input.postalCode }),
    };
}

/** Mirrors the backend constructors so invalid input is reported before sending. */
export function validateGeographicAssertions(
    input: GeographicAssertionsInput,
): GeographicAssertionsValidationError | undefined {
    const { addressText, country, subdivision, postalCode } = input;
    if (
        addressText === undefined &&
        country === undefined &&
        subdivision === undefined &&
        postalCode === undefined
    ) {
        return "EMPTY";
    }
    if (addressText !== undefined && !isBoundedText(addressText, MAX_ADDRESS_TEXT_BYTES)) {
        return "ADDRESS_TEXT_INVALID";
    }
    if (postalCode !== undefined && !isBoundedSingleLine(postalCode, MAX_POSTAL_CODE_BYTES)) {
        return "POSTAL_CODE_INVALID";
    }
    if (country !== undefined && !parseCountryCode(country)) return "COUNTRY_INVALID";
    if (subdivision !== undefined) {
        if (!parseSubdivisionCode(subdivision)) return "SUBDIVISION_INVALID";
        if (country !== undefined && getSubdivisionCountry(subdivision) !== country) {
            return "SUBDIVISION_COUNTRY_MISMATCH";
        }
    }
    return undefined;
}

const encoder = new TextEncoder();

export function utf8ByteLength(value: string): number {
    return encoder.encode(value).length;
}

/** Nonblank and within the UTF-8 byte limit. Line breaks are allowed. */
export function isBoundedText(value: string, maxBytes: number): boolean {
    return value.trim().length > 0 && utf8ByteLength(value) <= maxBytes;
}

/** C0/C1 control characters and the Unicode line and paragraph separators. */
function hasControlOrLineSeparator(value: string): boolean {
    for (const character of value) {
        const code = character.codePointAt(0) ?? 0;
        if (code <= 0x1f || (code >= 0x7f && code <= 0x9f) || code === 0x2028 || code === 0x2029) {
            return true;
        }
    }
    return false;
}

/** Nonblank, within the UTF-8 byte limit and free of control or line-separator characters. */
export function isBoundedSingleLine(value: string, maxBytes: number): boolean {
    return isBoundedText(value, maxBytes) && !hasControlOrLineSeparator(value);
}
