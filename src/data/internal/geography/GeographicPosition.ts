import type { GeographicOriginData, PartyLocationPosition } from "@/client";

export const GEOGRAPHIC_PRECISIONS = ["PREMISES", "STREET", "LOCALITY", "REPRESENTATIVE"] as const;
export type GeographicPrecision = (typeof GEOGRAPHIC_PRECISIONS)[number];

/** WGS 84 point in degrees. `(0, 0)` is a valid point, not a missing one. */
export type GeographicPoint = {
    readonly latitude: number;
    readonly longitude: number;
};

/** A point always carries explicit precision; decimal places never imply accuracy. */
export type GeographicPosition = {
    readonly point: GeographicPoint;
    readonly precision: GeographicPrecision;
    readonly accuracyMetres?: number;
};

export function parseGeographicPrecision(value: unknown): GeographicPrecision | undefined {
    return GEOGRAPHIC_PRECISIONS.find((precision) => precision === value);
}

/** Finite, in-range coordinates only; strings and out-of-range values are rejected, not clamped. */
export function parseGeographicPoint(
    latitude: unknown,
    longitude: unknown,
): GeographicPoint | undefined {
    if (typeof latitude !== "number" || typeof longitude !== "number") return undefined;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return undefined;
    if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return undefined;
    return { latitude, longitude };
}

export function mapToGeographicPoint(
    data: GeographicOriginData | null | undefined,
): GeographicPoint | undefined {
    return data ? parseGeographicPoint(data.latitude, data.longitude) : undefined;
}

export function mapToBackendGeographicPoint(point: GeographicPoint): GeographicOriginData {
    return { latitude: point.latitude, longitude: point.longitude };
}

/** Projections that return a point and its precision separately. Either missing drops both. */
export function mapToGeographicPositionParts(
    point: GeographicOriginData | null | undefined,
    precision: unknown,
): GeographicPosition | undefined {
    const parsedPoint = mapToGeographicPoint(point);
    const parsedPrecision = parseGeographicPrecision(precision);
    if (!parsedPoint || !parsedPrecision) return undefined;
    return { point: parsedPoint, precision: parsedPrecision };
}

export function mapToGeographicPosition(
    data: PartyLocationPosition | null | undefined,
): GeographicPosition | undefined {
    if (!data) return undefined;
    const point = parseGeographicPoint(data.latitudeDegrees, data.longitudeDegrees);
    const precision = parseGeographicPrecision(data.precision);
    if (!point || !precision) return undefined;

    const accuracy = data.accuracyMetres;
    return {
        point,
        precision,
        ...(typeof accuracy === "number" && Number.isFinite(accuracy) && accuracy >= 0
            ? { accuracyMetres: accuracy }
            : {}),
    };
}

export function mapToBackendGeographicPosition(
    position: GeographicPosition,
): PartyLocationPosition {
    return {
        latitudeDegrees: position.point.latitude,
        longitudeDegrees: position.point.longitude,
        precision: position.precision,
        ...(position.accuracyMetres === undefined
            ? {}
            : { accuracyMetres: position.accuracyMetres }),
    };
}

export function isValidGeographicPosition(position: GeographicPosition): boolean {
    return (
        parseGeographicPoint(position.point.latitude, position.point.longitude) !== undefined &&
        parseGeographicPrecision(position.precision) !== undefined &&
        (position.accuracyMetres === undefined ||
            (Number.isFinite(position.accuracyMetres) && position.accuracyMetres >= 0))
    );
}

/**
 * Rounds a distance to recorded evidence for display: 0.1 km for premises, 1 km for streets and
 * 10 km for broader or unknown precision. Never use the result as a continuation value.
 */
export function roundDisplayDistanceKm(
    distanceKm: number,
    precision: GeographicPrecision | undefined,
): number {
    switch (precision) {
        case "PREMISES":
            return Math.round(distanceKm * 10) / 10;
        case "STREET":
            return Math.round(distanceKm);
        default:
            return Math.round(distanceKm / 10) * 10;
    }
}
