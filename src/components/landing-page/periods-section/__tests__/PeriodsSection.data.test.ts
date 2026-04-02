import { describe, expect, it } from "vitest";
import { History } from "lucide-react";
import type { TFunction } from "i18next";
import {
    createLocalizedPeriodDateRangeMap,
    FALLBACK_PERIOD_ICON,
    PERIOD_DATE_RANGE_MAP,
    PERIOD_ICON_MAP,
    getPeriodDateRange,
    getPeriodIcon,
} from "../PeriodsSection.data.ts";

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

    it("returns a date range for known period keys", () => {
        const range = getPeriodDateRange("RENAISSANCE");
        expect(range).toBe(PERIOD_DATE_RANGE_MAP.RENAISSANCE);
    });

    it("returns undefined for unknown period keys", () => {
        const range = getPeriodDateRange("UNKNOWN_PERIOD_XYZ");
        expect(range).toBeUndefined();
    });

    it("creates localized ranges based on translation function", () => {
        const t = (key: string) => {
            if (key === "landingPage.periods.rangeBce") return "v. Chr.";
            if (key === "landingPage.periods.rangeCe") return "n. Chr.";
            if (key === "landingPage.periods.rangeToday") return "Heute";
            return key;
        };

        const localizedMap = createLocalizedPeriodDateRangeMap(t as TFunction);
        expect(localizedMap.ANTIQUITY).toBe("3000 v. Chr.-500 n. Chr.");
        expect(localizedMap.CONTEMPORARY).toBe("2000-Heute");
        expect(getPeriodDateRange("EARLY_MODERN", localizedMap)).toBe("1500-1800");
    });
});
