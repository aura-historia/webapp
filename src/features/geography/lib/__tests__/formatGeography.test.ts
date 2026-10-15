import type { TFunction } from "i18next";
import { describe, expect, it } from "vitest";
import {
    formatCoordinates,
    formatEvidenceDistanceKm,
    formatGeographicDistance,
} from "@/features/geography/lib/formatGeography.ts";

const t = ((key: string, values: Record<string, string>) =>
    `${key}:${JSON.stringify(values)}`) as unknown as TFunction;

describe("formatGeography", () => {
    it("formats distances in their supplied unit", () => {
        expect(formatGeographicDistance({ amount: 25, unit: "MILES" }, "en", t)).toBe("25 mi");
        expect(formatGeographicDistance({ amount: 1.5, unit: "KILOMETERS" }, "de", t)).toBe(
            "1,5 km",
        );
    });

    it("uses the translated label for nautical miles", () => {
        expect(formatGeographicDistance({ amount: 12, unit: "NAUTICAL_MILES" }, "en", t)).toBe(
            'geography.nauticalMiles:{"value":"12"}',
        );
    });

    it("rounds evidence distances to their precision", () => {
        expect(formatEvidenceDistanceKm(12.345, "PREMISES", "en")).toBe("12.3 km");
        expect(formatEvidenceDistanceKm(12.345, "STREET", "en")).toBe("12 km");
        expect(formatEvidenceDistanceKm(12.345, undefined, "en")).toBe("10 km");
    });

    it("formats coordinates without grouping", () => {
        expect(formatCoordinates({ latitude: -33.8688, longitude: 151.20929 }, "de", t)).toBe(
            'geography.coordinates:{"latitude":"-33,8688","longitude":"151,20929"}',
        );
    });
});
