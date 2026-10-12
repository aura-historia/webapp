import type { GeographicSearchData } from "@/client";
import {
    getSubdivisionCountry,
    parseCountryCode,
    parseSubdivisionCode,
    type CountryCode,
    type SubdivisionCode,
} from "@/data/internal/geography/GeographicCodes.ts";
import {
    mapToBackendGeographicRadius,
    mapToGeographicRadius,
    parseGeographicRadius,
    type GeographicDistance,
} from "@/data/internal/geography/GeographicDistance.ts";
import {
    mapToBackendGeographicPoint,
    mapToGeographicPoint,
    parseGeographicPoint,
    type GeographicPoint,
} from "@/data/internal/geography/GeographicPosition.ts";

export const PROXIMITY_MODES = ["STRICT", "APPROXIMATE"] as const;
export type ProximityMode = (typeof PROXIMITY_MODES)[number];

export const DISTANCE_ORDERS = ["ASC", "DESC"] as const;
export type DistanceOrder = (typeof DISTANCE_ORDERS)[number];

export const MAX_GEOGRAPHIC_CODES = 100;

/**
 * The single `geography` predicate of a listing search, saved search or Party-location discovery.
 * Values within a code set are OR; distinct predicates are AND; missing geography never matches.
 * Radius and distance ordering need an explicit numeric origin, never an address or preference.
 */
export type GeographicSearch = {
    readonly countries: readonly CountryCode[];
    readonly subdivisions: readonly SubdivisionCode[];
    readonly origin?: GeographicPoint;
    readonly radius?: GeographicDistance;
    /** Strict (the backend default) admits premises evidence only. */
    readonly mode?: ProximityMode;
    /** Incompatible with the ordinary listing `sort`; send one or the other. */
    readonly distanceOrder?: DistanceOrder;
};

/** A stored predicate exists but contains values this app cannot represent. */
export const UNSUPPORTED_GEOGRAPHY = "UNSUPPORTED";
export type UnsupportedGeography = typeof UNSUPPORTED_GEOGRAPHY;

export type GeographicSearchValidationError =
    | "EMPTY"
    | "TOO_MANY_CODES"
    | "COUNTRY_INVALID"
    | "SUBDIVISION_INVALID"
    | "SUBDIVISION_OUTSIDE_COUNTRIES"
    | "ORIGIN_INVALID"
    | "RADIUS_INVALID"
    | "ORIGIN_REQUIRED"
    | "PROXIMITY_REQUIRED";

/**
 * Maps a returned predicate. Any unrecognized code, unit, mode or order yields
 * `UNSUPPORTED_GEOGRAPHY` rather than a narrower predicate that would silently match more.
 */
export function mapToGeographicSearch(
    data: GeographicSearchData | null | undefined,
): GeographicSearch | UnsupportedGeography | undefined {
    if (!data) return undefined;

    const countries = (data.countries ?? []).map(parseCountryCode);
    const subdivisions = (data.subdivisions ?? []).map(parseSubdivisionCode);
    const origin = mapToGeographicPoint(data.origin);
    const radius = mapToGeographicRadius(data.radius);
    const mode = PROXIMITY_MODES.find((value) => value === data.mode);
    const distanceOrder = DISTANCE_ORDERS.find((value) => value === data.distanceOrder);

    if (
        countries.some((code) => !code) ||
        subdivisions.some((code) => !code) ||
        (data.origin != null && !origin) ||
        (data.radius != null && !radius) ||
        (data.mode != null && !mode) ||
        (data.distanceOrder != null && !distanceOrder)
    ) {
        return UNSUPPORTED_GEOGRAPHY;
    }

    return {
        countries: countries as CountryCode[],
        subdivisions: subdivisions as SubdivisionCode[],
        ...(origin ? { origin } : {}),
        ...(radius ? { radius } : {}),
        ...(mode ? { mode } : {}),
        ...(distanceOrder ? { distanceOrder } : {}),
    };
}

export function mapToBackendGeographicSearch(search: GeographicSearch): GeographicSearchData {
    return {
        ...(search.countries.length ? { countries: [...search.countries] } : {}),
        ...(search.subdivisions.length ? { subdivisions: [...search.subdivisions] } : {}),
        ...(search.origin ? { origin: mapToBackendGeographicPoint(search.origin) } : {}),
        ...(search.radius ? { radius: mapToBackendGeographicRadius(search.radius) } : {}),
        ...(search.mode ? { mode: search.mode } : {}),
        ...(search.distanceOrder ? { distanceOrder: search.distanceOrder } : {}),
    };
}

/** Mirrors the backend's predicate rules so an invalid search is not sent. */
export function validateGeographicSearch(
    search: GeographicSearch,
): GeographicSearchValidationError | undefined {
    const hasProximity = search.radius !== undefined || search.distanceOrder !== undefined;
    if (!search.countries.length && !search.subdivisions.length && !hasProximity) return "EMPTY";
    if (
        search.countries.length > MAX_GEOGRAPHIC_CODES ||
        search.subdivisions.length > MAX_GEOGRAPHIC_CODES
    ) {
        return "TOO_MANY_CODES";
    }
    if (search.countries.some((code) => !parseCountryCode(code))) return "COUNTRY_INVALID";
    if (search.subdivisions.some((code) => !parseSubdivisionCode(code))) {
        return "SUBDIVISION_INVALID";
    }
    if (
        search.countries.length &&
        search.subdivisions.some((code) => !search.countries.includes(getSubdivisionCountry(code)))
    ) {
        return "SUBDIVISION_OUTSIDE_COUNTRIES";
    }
    if (search.origin && !parseGeographicPoint(search.origin.latitude, search.origin.longitude)) {
        return "ORIGIN_INVALID";
    }
    if (search.radius && !parseGeographicRadius(search.radius.amount, search.radius.unit)) {
        return "RADIUS_INVALID";
    }
    if (hasProximity && !search.origin) return "ORIGIN_REQUIRED";
    if (!hasProximity && (search.origin || search.mode)) return "PROXIMITY_REQUIRED";
    return undefined;
}
