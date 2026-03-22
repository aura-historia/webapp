import { describe, expect, it } from "vitest";
import { History } from "lucide-react";
import { PERIOD_ICON_MAP, FALLBACK_PERIOD_ICON, getPeriodIcon } from "../PeriodsSection.data.ts";

describe("getPeriodIcon", () => {
    it("returns the correct icon for a known period key", () => {
        const icon = getPeriodIcon("RENAISSANCE");
        expect(icon).toBe(PERIOD_ICON_MAP.RENAISSANCE);
    });

    it("returns the fallback History icon for an unknown period key", () => {
        const icon = getPeriodIcon("UNKNOWN_PERIOD_XYZ");
        expect(icon).toBe(FALLBACK_PERIOD_ICON);
        expect(icon).toBe(History);
    });

    it("returns the fallback icon for an empty string", () => {
        const icon = getPeriodIcon("");
        expect(icon).toBe(FALLBACK_PERIOD_ICON);
    });

    it("returns correct icons for all known period keys", () => {
        const knownKeys = Object.keys(PERIOD_ICON_MAP);
        for (const key of knownKeys) {
            const icon = getPeriodIcon(key);
            expect(icon).toBe(PERIOD_ICON_MAP[key]);
        }
    });
});
