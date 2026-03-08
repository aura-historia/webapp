import { describe, expect, it } from "vitest";
import { Folder } from "lucide-react";
import {
    CATEGORY_ICON_MAP,
    FALLBACK_CATEGORY_ICON,
    getCategoryIcon,
} from "../CategoriesSection.data.ts";

describe("getCategoryIcon", () => {
    it("returns the correct icon for a known category key", () => {
        const icon = getCategoryIcon("FURNITURE");
        expect(icon).toBe(CATEGORY_ICON_MAP.FURNITURE);
    });

    it("returns the fallback Folder icon for an unknown category key", () => {
        const icon = getCategoryIcon("UNKNOWN_CATEGORY_XYZ");
        expect(icon).toBe(FALLBACK_CATEGORY_ICON);
        expect(icon).toBe(Folder);
    });

    it("returns the fallback icon for an empty string", () => {
        const icon = getCategoryIcon("");
        expect(icon).toBe(FALLBACK_CATEGORY_ICON);
    });

    it("returns correct icons for all known category keys", () => {
        const knownKeys = Object.keys(CATEGORY_ICON_MAP);
        for (const key of knownKeys) {
            const icon = getCategoryIcon(key);
            expect(icon).toBe(CATEGORY_ICON_MAP[key]);
        }
    });

    it("CATEGORY_ICON_MAP contains at least 20 entries", () => {
        expect(Object.keys(CATEGORY_ICON_MAP).length).toBeGreaterThanOrEqual(20);
    });
});
