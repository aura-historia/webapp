import type { ListingGeographyData } from "@/client";
import {
    getSubdivisionCountry,
    parseCountryCode,
    parseGeographicReferenceRelease,
    parseSubdivisionCode,
    type CountryCode,
    type GeographicReferenceRelease,
    type SubdivisionCode,
} from "@/data/internal/geography/GeographicCodes.ts";
import {
    mapToGeographicPositionParts,
    type GeographicPosition,
} from "@/data/internal/geography/GeographicPosition.ts";

/**
 * Public advertised-inventory geography selected by the backend from a source default. It never
 * claims verified custody of the individual object; distance is to recorded evidence.
 */
export type ListingGeography = {
    /** Opaque PartyLocation ID. */
    readonly locationId: string;
    readonly basis: "SOURCE_DEFAULT_DERIVED";
    readonly referenceRelease: GeographicReferenceRelease;
    readonly country?: CountryCode;
    readonly subdivision?: SubdivisionCode;
    readonly position?: GeographicPosition;
    /** Present only for distance-aware searches. */
    readonly distanceKm?: number;
};

/**
 * Unknown bases or releases yield no geography, because their codes cannot be interpreted.
 * Individually unrecognized facts are omitted rather than coerced.
 */
export function mapToListingGeography(
    data: ListingGeographyData | null | undefined,
): ListingGeography | undefined {
    if (data?.basis !== "SOURCE_DEFAULT_DERIVED") return undefined;
    const referenceRelease = parseGeographicReferenceRelease(data.referenceRelease);
    if (!referenceRelease) return undefined;

    const country = parseCountryCode(data.country);
    const subdivision = parseSubdivisionCode(data.subdivision);
    const position = mapToGeographicPositionParts(data.point, data.precision);
    const distanceKm = data.distanceKm;

    return {
        locationId: data.locationId,
        basis: data.basis,
        referenceRelease,
        ...(country ? { country } : {}),
        ...(subdivision && (!country || getSubdivisionCountry(subdivision) === country)
            ? { subdivision }
            : {}),
        ...(position ? { position } : {}),
        ...(typeof distanceKm === "number" && Number.isFinite(distanceKm) && distanceKm >= 0
            ? { distanceKm }
            : {}),
    };
}
