import type { CountryCode, SubdivisionCode } from "@/data/internal/geography/GeographicCodes.ts";
import type { GeographicDistance } from "@/data/internal/geography/GeographicDistance.ts";
import type { GeographicPoint } from "@/data/internal/geography/GeographicPosition.ts";
import {
    UNSUPPORTED_GEOGRAPHY,
    type GeographicSearch,
    type UnsupportedGeography,
} from "@/data/internal/geography/GeographicSearch.ts";
import type { SearchLocation, SearchNear } from "@/data/internal/search/SearchLocation.ts";

/** The point a saved search already stores. It is a private copy, never linked to an address. */
export type SavedOriginNear = { readonly kind: "SAVED"; readonly point: GeographicPoint };

/** Where a saved search's distance starts: the stored point, or a new one chosen in the wizard. */
export type SavedSearchNear = SearchNear | SavedOriginNear;

/**
 * The wizard's Location step. Like the search page, a saved search filters by region or by
 * distance, never both. A stored predicate the step cannot edit (a combination, an order without
 * a distance, an unknown value) is `UNSUPPORTED`: it is kept as saved or removed as a whole.
 * Search filters have no distance order.
 */
export type SavedSearchLocation =
    | {
          readonly kind: "REGION";
          readonly countries: readonly CountryCode[];
          readonly subdivisions: readonly SubdivisionCode[];
      }
    | {
          readonly kind: "DISTANCE";
          readonly near: SavedSearchNear;
          /** Any unit the API accepts; a unit saved elsewhere is kept until it is changed. */
          readonly radius: GeographicDistance;
      }
    | { readonly kind: "UNSUPPORTED" };

/** What a save does with the stored geography. */
export type GeographyChange =
    /** Leave the stored snapshot as it is (PATCH omits `geography`, a create sends none). */
    | { readonly kind: "keep" }
    /** Replace the snapshot as a whole, or clear it with `null`. */
    | { readonly kind: "set"; readonly geography: GeographicSearch | null }
    /** A starting point is chosen but cannot be used yet. */
    | { readonly kind: "blocked"; readonly reason: "loading" | "unavailable" };

/** The Location step's starting value for a stored snapshot. */
export function toSavedSearchLocation(
    geography: GeographicSearch | UnsupportedGeography | undefined,
): SavedSearchLocation | undefined {
    if (!geography) return undefined;
    if (geography === UNSUPPORTED_GEOGRAPHY) return { kind: "UNSUPPORTED" };
    const hasPlaces = geography.countries.length > 0 || geography.subdivisions.length > 0;
    if (geography.origin && geography.radius && !hasPlaces && !geography.distanceOrder) {
        return {
            kind: "DISTANCE",
            near: { kind: "SAVED", point: geography.origin },
            radius: geography.radius,
        };
    }
    if (hasPlaces && !geography.origin && !geography.radius && !geography.distanceOrder) {
        return {
            kind: "REGION",
            countries: geography.countries,
            subdivisions: geography.subdivisions,
        };
    }
    return { kind: "UNSUPPORTED" };
}

/**
 * The predicate a location sends, given the point its starting point resolves to. A distance
 * always counts approximate locations too and is sent with that mode, because the API defaults to
 * strict. Returns `undefined` while a chosen starting point has no point.
 */
export function toGeographicSearch(
    location: Exclude<SavedSearchLocation, { kind: "UNSUPPORTED" }>,
    origin: GeographicPoint | undefined,
): GeographicSearch | undefined {
    if (location.kind === "REGION") {
        return { countries: location.countries, subdivisions: location.subdivisions };
    }
    const point = location.near.kind === "SAVED" ? location.near.point : origin;
    if (!point) return undefined;
    return {
        countries: [],
        subdivisions: [],
        origin: point,
        radius: location.radius,
        mode: "APPROXIMATE",
    };
}

/**
 * The search page's location as a saved predicate. The search's distance order is a sort and is
 * not saved, like every other sort.
 */
export function searchLocationToGeographicSearch(
    location: SearchLocation | undefined,
    origin: GeographicPoint | undefined,
): GeographicSearch | undefined {
    if (!location) return undefined;
    if (location.kind === "REGION") return toGeographicSearch(location, undefined);
    return toGeographicSearch(
        { kind: "DISTANCE", near: location.near, radius: location.radius },
        origin,
    );
}

type OriginState =
    | { readonly status: "none" | "loading" }
    | { readonly status: "ready"; readonly point: GeographicPoint }
    | { readonly status: "unavailable" };

/**
 * What saving the wizard sends for its Location step:
 * - untouched: an edit omits `geography` (the snapshot stays exactly as saved) and a duplicate
 *   copies the stored predicate verbatim;
 * - removed, or Near set back to Everywhere: an edit clears it with `null`, a new filter sends none;
 * - changed: the whole predicate is replaced.
 */
export function resolveGeographyChange({
    mode,
    stored,
    location,
    touched,
    origin,
}: {
    readonly mode: "create" | "edit" | "duplicate";
    readonly stored: GeographicSearch | UnsupportedGeography | undefined;
    readonly location: SavedSearchLocation | undefined;
    readonly touched: boolean;
    readonly origin: OriginState;
}): GeographyChange {
    if (!touched) {
        if (mode === "duplicate" && stored && stored !== UNSUPPORTED_GEOGRAPHY) {
            return { kind: "set", geography: stored };
        }
        return { kind: "keep" };
    }
    if (!location) return mode === "edit" ? { kind: "set", geography: null } : { kind: "keep" };
    if (location.kind === "UNSUPPORTED") return { kind: "keep" };
    const point = origin.status === "ready" ? origin.point : undefined;
    const geography = toGeographicSearch(location, point);
    if (geography) return { kind: "set", geography };
    return { kind: "blocked", reason: origin.status === "unavailable" ? "unavailable" : "loading" };
}

/**
 * The predicate the saved filter will hold after saving, for the preview and the summary:
 * `undefined` when it has none, `UNSUPPORTED` when it keeps one the app cannot show or send.
 */
export function effectiveGeography(
    change: GeographyChange,
    stored: GeographicSearch | UnsupportedGeography | undefined,
    mode: "create" | "edit" | "duplicate",
): GeographicSearch | UnsupportedGeography | undefined {
    if (change.kind === "set") return change.geography ?? undefined;
    if (change.kind === "keep" && mode === "edit") return stored;
    return undefined;
}
