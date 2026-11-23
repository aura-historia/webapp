import type { TFunction } from "i18next";
import {
    INTL_DISTANCE_UNITS,
    type GeographicDistance,
} from "@/data/internal/geography/GeographicDistance.ts";
import {
    roundDisplayDistanceKm,
    type GeographicPoint,
    type GeographicPrecision,
} from "@/data/internal/geography/GeographicPosition.ts";

export { formatCountryName } from "@/data/internal/geography/GeographicCodes.ts";

const MAX_DISTANCE_FRACTION_DIGITS = 2;
const COORDINATE_FRACTION_DIGITS = 5;

/** Formats a distance in the unit it was supplied in; it is never converted. */
export function formatGeographicDistance(
    distance: GeographicDistance,
    language: string,
    t: TFunction,
): string {
    const unit = INTL_DISTANCE_UNITS[distance.unit];
    if (unit) {
        return new Intl.NumberFormat(language, {
            style: "unit",
            unit,
            unitDisplay: "short",
            maximumFractionDigits: MAX_DISTANCE_FRACTION_DIGITS,
        }).format(distance.amount);
    }
    const value = new Intl.NumberFormat(language, {
        maximumFractionDigits: MAX_DISTANCE_FRACTION_DIGITS,
    }).format(distance.amount);
    return t("geography.nauticalMiles", { value });
}

/**
 * Formats a distance to recorded location evidence, rounded to what the evidence supports. It is
 * a straight-line distance, not a journey distance or a verified object position.
 */
export function formatEvidenceDistanceKm(
    distanceKm: number,
    precision: GeographicPrecision | undefined,
    language: string,
): string {
    return new Intl.NumberFormat(language, {
        style: "unit",
        unit: "kilometer",
        unitDisplay: "short",
        maximumFractionDigits: precision === "PREMISES" ? 1 : 0,
    }).format(roundDisplayDistanceKm(distanceKm, precision));
}

/** Signed decimal degrees, latitude first. Fraction digits never imply accuracy. */
export function formatCoordinates(point: GeographicPoint, language: string, t: TFunction): string {
    const format = new Intl.NumberFormat(language, {
        maximumFractionDigits: COORDINATE_FRACTION_DIGITS,
        useGrouping: false,
    });
    return t("geography.coordinates", {
        latitude: format.format(point.latitude),
        longitude: format.format(point.longitude),
    });
}

const KILOMETRES_PER_MILE = 1.609344;

/**
 * A distance to recorded evidence in the unit the search uses, rounded by precision like
 * `formatEvidenceDistanceKm` (0.1, 1 or 10 of that unit). `approximate` marks evidence known only
 * to a locality or region, whose distance is shown as "about …".
 */
export function formatEvidenceDistance(
    distanceKm: number,
    precision: GeographicPrecision | undefined,
    unit: "KILOMETERS" | "MILES",
    language: string,
): { readonly text: string; readonly approximate: boolean } {
    const amount = unit === "MILES" ? distanceKm / KILOMETRES_PER_MILE : distanceKm;
    return {
        text: new Intl.NumberFormat(language, {
            style: "unit",
            unit: unit === "MILES" ? "mile" : "kilometer",
            unitDisplay: "short",
            maximumFractionDigits: precision === "PREMISES" ? 1 : 0,
        }).format(roundDisplayDistanceKm(amount, precision)),
        approximate: precision !== "PREMISES" && precision !== "STREET",
    };
}
