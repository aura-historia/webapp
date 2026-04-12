import { describe, expect, it } from "vitest";
import {
    CATEGORY_ASSET_MAP,
    CATEGORY_HEADER_ASSET_MAP,
    FALLBACK_CATEGORY_ASSET_URL,
    FALLBACK_CATEGORY_HEADER_ASSET_URL,
    getCategoryAssetUrl,
    getCategoryHeaderAssetUrl,
} from "../CategoriesSection.data.ts";

describe("getCategoryAssetUrl", () => {
    it("returns the correct URL for a known category key", () => {
        const url = getCategoryAssetUrl("FURNITURE");
        expect(url).toBe(CATEGORY_ASSET_MAP.FURNITURE);
    });

    it("returns the fallback URL for an unknown category key", () => {
        const url = getCategoryAssetUrl("UNKNOWN_CATEGORY_XYZ");
        expect(url).toBe(FALLBACK_CATEGORY_ASSET_URL);
    });

    it("returns the fallback URL for an empty string", () => {
        const url = getCategoryAssetUrl("");
        expect(url).toBe(FALLBACK_CATEGORY_ASSET_URL);
    });

    it("returns correct URLs for all known category keys", () => {
        const knownKeys = Object.keys(CATEGORY_ASSET_MAP);
        for (const key of knownKeys) {
            const url = getCategoryAssetUrl(key);
            expect(url).toBe(CATEGORY_ASSET_MAP[key]);
        }
    });

    it("CATEGORY_ASSET_MAP contains at least 20 entries", () => {
        expect(Object.keys(CATEGORY_ASSET_MAP).length).toBeGreaterThanOrEqual(20);
    });
});

describe("getCategoryHeaderAssetUrl", () => {
    it("returns the correct header URL for a known category key", () => {
        const url = getCategoryHeaderAssetUrl("FURNITURE");
        expect(url).toBe(CATEGORY_HEADER_ASSET_MAP.FURNITURE);
    });

    it("returns the fallback header URL for an unknown category key", () => {
        const url = getCategoryHeaderAssetUrl("UNKNOWN_CATEGORY_XYZ");
        expect(url).toBe(FALLBACK_CATEGORY_HEADER_ASSET_URL);
    });

    it("returns the fallback header URL for an empty string", () => {
        const url = getCategoryHeaderAssetUrl("");
        expect(url).toBe(FALLBACK_CATEGORY_HEADER_ASSET_URL);
    });

    it("returns header URLs that consistently end in -header.webp", () => {
        const knownKeys = Object.keys(CATEGORY_HEADER_ASSET_MAP);
        for (const key of knownKeys) {
            const url = getCategoryHeaderAssetUrl(key);
            expect(url).toMatch(/-header\.webp$/);
        }
    });
});
