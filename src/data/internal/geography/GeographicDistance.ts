import type { GeographicRadiusData } from "@/client";

export const DISTANCE_UNITS = [
    "KILOMETERS",
    "MILES",
    "METERS",
    "YARDS",
    "FEET",
    "INCHES",
    "CENTIMETERS",
    "MILLIMETERS",
    "NAUTICAL_MILES",
] as const satisfies readonly GeographicRadiusData["unit"][];
export type DistanceUnit = (typeof DISTANCE_UNITS)[number];

/** A distance in the unit the user supplied. The backend preserves the unit; never convert it. */
export type GeographicDistance = {
    readonly amount: number;
    readonly unit: DistanceUnit;
};

export const MAX_RADIUS_KILOMETRES = 20_000;

const METRES_PER_UNIT: Record<DistanceUnit, number> = {
    KILOMETERS: 1000,
    MILES: 1609.344,
    METERS: 1,
    YARDS: 0.9144,
    FEET: 0.3048,
    INCHES: 0.0254,
    CENTIMETERS: 0.01,
    MILLIMETERS: 0.001,
    NAUTICAL_MILES: 1852,
};

/** Units with a sanctioned `Intl.NumberFormat` unit identifier. Nautical miles have none. */
export const INTL_DISTANCE_UNITS: Partial<Record<DistanceUnit, string>> = {
    KILOMETERS: "kilometer",
    MILES: "mile",
    METERS: "meter",
    YARDS: "yard",
    FEET: "foot",
    INCHES: "inch",
    CENTIMETERS: "centimeter",
    MILLIMETERS: "millimeter",
};

export function parseDistanceUnit(value: unknown): DistanceUnit | undefined {
    return DISTANCE_UNITS.find((unit) => unit === value);
}

export function toKilometres(distance: GeographicDistance): number {
    return (distance.amount * METRES_PER_UNIT[distance.unit]) / 1000;
}

/** A finite positive radius no larger than the equivalent of 20,000 km. */
export function parseGeographicRadius(
    amount: unknown,
    unit: unknown,
): GeographicDistance | undefined {
    const parsedUnit = parseDistanceUnit(unit);
    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0 || !parsedUnit) {
        return undefined;
    }
    const radius = { amount, unit: parsedUnit };
    return toKilometres(radius) <= MAX_RADIUS_KILOMETRES ? radius : undefined;
}

export function mapToGeographicRadius(
    data: GeographicRadiusData | null | undefined,
): GeographicDistance | undefined {
    return data ? parseGeographicRadius(data.amount, data.unit) : undefined;
}

export function mapToBackendGeographicRadius(radius: GeographicDistance): GeographicRadiusData {
    return { amount: radius.amount, unit: radius.unit };
}
