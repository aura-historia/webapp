import type { MeasurementUnitData } from "@/client";

const IMPERIAL_REGIONS = new Set(["US", "LR", "MM"]);

export const UNIT_SYSTEMS = ["METRIC", "IMPERIAL"] as const;
export type UnitSystem = (typeof UNIT_SYSTEMS)[number];

export function parseUnitSystem(unitSystem?: string): UnitSystem {
    const uppercasedUnitSystem = unitSystem?.toUpperCase() ?? "METRIC";

    switch (uppercasedUnitSystem) {
        case "METRIC":
        case "IMPERIAL":
            return uppercasedUnitSystem;
        default:
            return "METRIC";
    }
}

export function inferUnitSystemFromLocale(locale: string): UnitSystem {
    try {
        const region = new Intl.Locale(locale).maximize().region;
        return region && IMPERIAL_REGIONS.has(region) ? "IMPERIAL" : "METRIC";
    } catch {
        return "METRIC";
    }
}

export function mapToBackendUnitSystem(unitSystem?: UnitSystem): MeasurementUnitData | null {
    if (!unitSystem) return null;

    switch (unitSystem) {
        case "METRIC":
        case "IMPERIAL":
            return unitSystem;
    }
}
