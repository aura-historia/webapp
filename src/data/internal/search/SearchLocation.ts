import {
    getSubdivisionCountry,
    parseCountryCode,
    parseSubdivisionCode,
    type CountryCode,
    type SubdivisionCode,
} from "@/data/internal/geography/GeographicCodes.ts";
import {
    parseGeographicRadius,
    type GeographicDistance,
} from "@/data/internal/geography/GeographicDistance.ts";
import type { GeographicPoint } from "@/data/internal/geography/GeographicPosition.ts";
import {
    MAX_GEOGRAPHIC_CODES,
    type DistanceOrder,
    type GeographicSearch,
} from "@/data/internal/geography/GeographicSearch.ts";

/** The units the search page offers; the API takes more, but people search in km or miles. */
export const SEARCH_DISTANCE_UNITS = ["KILOMETERS", "MILES"] as const;
export type SearchDistanceUnit = (typeof SEARCH_DISTANCE_UNITS)[number];

export const DEFAULT_SEARCH_RADIUS_AMOUNT = 50;

/**
 * Where a distance search starts. Only references go into the URL, never coordinates or address
 * text: a saved address is read again from the owner's address book, the current location lives
 * in memory for the current page only.
 */
export type SearchNear =
    | { readonly kind: "SEARCH_LOCATION" }
    | { readonly kind: "ADDRESS"; readonly addressId: string }
    | { readonly kind: "CURRENT" };

export type SearchDistance = {
    readonly amount: number;
    readonly unit: SearchDistanceUnit;
};

/**
 * The search page's location filter. Searching by region and searching by distance are
 * exclusive; "Everywhere" is no location filter at all. A distance search always counts
 * approximate locations too (#1391), so it carries no proximity mode.
 */
export type SearchLocation =
    | {
          readonly kind: "REGION";
          readonly countries: readonly CountryCode[];
          readonly subdivisions: readonly SubdivisionCode[];
      }
    | {
          readonly kind: "DISTANCE";
          readonly near: SearchNear;
          readonly radius: SearchDistance;
          /** Replaces the ordinary sort while set. */
          readonly distanceOrder?: DistanceOrder;
      };

/** The location filter's URL parameters. */
export type SearchLocationUrlParams = {
    countries?: string[];
    regions?: string[];
    near?: string;
    radius?: number;
    unit?: SearchDistanceUnit;
};

export type RawSearchLocationParams = {
    countries?: unknown;
    regions?: unknown;
    near?: unknown;
    radius?: unknown;
    unit?: unknown;
    sortField?: unknown;
    sortOrder?: unknown;
};

const NEAR_SEARCH_LOCATION = "search-location";
const NEAR_CURRENT = "current";
const NEAR_ADDRESS_PREFIX = "address:";
/** Server-generated TypeIDs; anything else is not an address reference. */
const ADDRESS_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

export const DISTANCE_SORT_FIELD = "DISTANCE" as const;

function toArray(value: unknown): unknown[] {
    if (value === undefined || value === null) return [];
    return Array.isArray(value) ? value : [value];
}

function unique<T>(values: readonly T[]): T[] {
    return [...new Set(values)];
}

export function parseSearchNear(value: unknown): SearchNear | undefined {
    if (value === NEAR_SEARCH_LOCATION) return { kind: "SEARCH_LOCATION" };
    if (value === NEAR_CURRENT) return { kind: "CURRENT" };
    if (typeof value === "string" && value.startsWith(NEAR_ADDRESS_PREFIX)) {
        const addressId = value.slice(NEAR_ADDRESS_PREFIX.length);
        return ADDRESS_ID_PATTERN.test(addressId) ? { kind: "ADDRESS", addressId } : undefined;
    }
    return undefined;
}

export function serializeSearchNear(near: SearchNear): string {
    switch (near.kind) {
        case "SEARCH_LOCATION":
            return NEAR_SEARCH_LOCATION;
        case "CURRENT":
            return NEAR_CURRENT;
        case "ADDRESS":
            return `${NEAR_ADDRESS_PREFIX}${near.addressId}`;
    }
}

export function isSameSearchNear(a: SearchNear | undefined, b: SearchNear | undefined): boolean {
    if (!a || !b) return a === b;
    return serializeSearchNear(a) === serializeSearchNear(b);
}

export function parseSearchDistanceUnit(value: unknown): SearchDistanceUnit | undefined {
    return SEARCH_DISTANCE_UNITS.find((unit) => unit === value);
}

/** A positive distance within the backend's limit, or `undefined`. */
export function parseSearchDistance(amount: unknown, unit: unknown): SearchDistance | undefined {
    const parsedUnit = parseSearchDistanceUnit(unit);
    const parsedAmount = typeof amount === "string" && amount !== "" ? Number(amount) : amount;
    if (!parsedUnit) return undefined;
    const radius = parseGeographicRadius(parsedAmount, parsedUnit);
    return radius ? { amount: radius.amount, unit: parsedUnit } : undefined;
}

/**
 * Reads the location filter from the URL. A starting point makes it a distance search, and any
 * places then in the URL are ignored. An invalid distance falls back to the default 50 in the
 * given unit (kilometres when none), so a hand-edited link still searches. An old `proximity`
 * parameter is ignored.
 */
export function parseSearchLocation(raw: RawSearchLocationParams): SearchLocation | undefined {
    const near = parseSearchNear(raw.near);
    if (near) {
        const unit = parseSearchDistanceUnit(raw.unit) ?? "KILOMETERS";
        return {
            kind: "DISTANCE",
            near,
            radius: parseSearchDistance(raw.radius, unit) ?? {
                amount: DEFAULT_SEARCH_RADIUS_AMOUNT,
                unit,
            },
            ...(raw.sortField === DISTANCE_SORT_FIELD
                ? { distanceOrder: raw.sortOrder === "DESC" ? "DESC" : "ASC" }
                : {}),
        };
    }

    const countries = unique(
        toArray(raw.countries)
            .map(parseCountryCode)
            .filter((code): code is CountryCode => code !== undefined),
    ).slice(0, MAX_GEOGRAPHIC_CODES);
    const subdivisions = unique(
        toArray(raw.regions)
            .map(parseSubdivisionCode)
            .filter((code): code is SubdivisionCode => code !== undefined),
    )
        .filter((code) => countries.length === 0 || countries.includes(getSubdivisionCountry(code)))
        .slice(0, MAX_GEOGRAPHIC_CODES);

    if (!countries.length && !subdivisions.length) return undefined;
    return { kind: "REGION", countries, subdivisions };
}

export function serializeSearchLocation(
    location: SearchLocation | undefined,
): SearchLocationUrlParams {
    if (!location) return {};
    if (location.kind === "REGION") {
        return {
            ...(location.countries.length ? { countries: [...location.countries] } : {}),
            ...(location.subdivisions.length ? { regions: [...location.subdivisions] } : {}),
        };
    }
    return {
        near: serializeSearchNear(location.near),
        radius: location.radius.amount,
        unit: location.radius.unit,
    };
}

/**
 * The `geography` predicate to send. A distance search sends nothing until its starting point is
 * known; it then always sends the approximate mode, because the backend's default is strict.
 */
export function mapSearchLocationToGeographicSearch(
    location: SearchLocation | undefined,
    origin: GeographicPoint | undefined,
): GeographicSearch | undefined {
    if (!location) return undefined;
    if (location.kind === "REGION") {
        return { countries: location.countries, subdivisions: location.subdivisions };
    }
    if (!origin) return undefined;
    return {
        countries: [],
        subdivisions: [],
        origin,
        radius: location.radius satisfies GeographicDistance,
        mode: "APPROXIMATE",
        ...(location.distanceOrder ? { distanceOrder: location.distanceOrder } : {}),
    };
}

/**
 * Adds a place. Chosen places read as "any of these", but the API joins the country set and the
 * region set with AND (a region narrows its country), so "Saxony or Austria" cannot be sent.
 * Places therefore stay on one level: adding a country replaces chosen regions and adding a
 * region replaces chosen countries.
 */
export function addRegionPlace(
    location: SearchLocation | undefined,
    code: CountryCode | SubdivisionCode,
): SearchLocation {
    const current = location?.kind === "REGION" ? location : { countries: [], subdivisions: [] };
    const country = parseCountryCode(code);
    if (country) {
        return {
            kind: "REGION",
            countries: unique([...current.countries, country]).slice(0, MAX_GEOGRAPHIC_CODES),
            subdivisions: [],
        };
    }
    return {
        kind: "REGION",
        countries: [],
        subdivisions: unique([...current.subdivisions, code as SubdivisionCode]).slice(
            0,
            MAX_GEOGRAPHIC_CODES,
        ),
    };
}

/** Removes a place; removing a country also removes its regions. */
export function removeRegionPlace(
    location: SearchLocation | undefined,
    code: string,
): SearchLocation | undefined {
    if (location?.kind !== "REGION") return location;
    const countries = location.countries.filter((country) => country !== code);
    const subdivisions = location.subdivisions.filter(
        (subdivision) => subdivision !== code && getSubdivisionCountry(subdivision) !== code,
    );
    return countries.length || subdivisions.length
        ? { kind: "REGION", countries, subdivisions }
        : undefined;
}
