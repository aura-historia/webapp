import { describe, expect, it } from "vitest";
import type { TFunction } from "i18next";
import {
    createLocalizedPeriodDateRangeMap,
    FALLBACK_PERIOD_ASSET_URL,
    PERIOD_DATE_RANGE_MAP,
    PERIOD_ASSET_MAP,
    getPeriodDateRange,
    getPeriodAssetUrl,
} from "../PeriodsSection.data.ts";

describe("getPeriodAssetUrl", () => {
    it("returns the correct image URL for a known period key", () => {
        const assetUrl = getPeriodAssetUrl("RENAISSANCE");
        expect(assetUrl).toBe(PERIOD_ASSET_MAP.RENAISSANCE);
    });

    it("returns the fallback URL for an unknown period key", () => {
        const assetUrl = getPeriodAssetUrl("UNKNOWN_PERIOD_XYZ");
        expect(assetUrl).toBe(FALLBACK_PERIOD_ASSET_URL);
    });

    it("returns the fallback URL for an empty string", () => {
        const assetUrl = getPeriodAssetUrl("");
        expect(assetUrl).toBe(FALLBACK_PERIOD_ASSET_URL);
    });

    it("returns correct URLs for all known period keys", () => {
        const knownKeys = Object.keys(PERIOD_ASSET_MAP);
        for (const key of knownKeys) {
            const assetUrl = getPeriodAssetUrl(key);
            expect(assetUrl).toBe(PERIOD_ASSET_MAP[key]);
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
