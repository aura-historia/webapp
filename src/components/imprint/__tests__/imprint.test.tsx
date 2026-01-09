import { describe, it, expect, vi } from "vitest";
import { IMPRINT_LOCALE_MAP } from "@/assets/content/imprint/imprint-asset-map.ts";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                "imprint.title": "Impressum",
            };
            return translations[key] || key;
        },
        i18n: {
            language: "de",
        },
    }),
}));

describe("Imprint Page Logic", () => {
    describe("IMPRINT_LOCALE_MAP", () => {
        it("should contain German locale content", () => {
            expect(IMPRINT_LOCALE_MAP).toHaveProperty("de");
            expect(typeof IMPRINT_LOCALE_MAP.de).toBe("string");
        });

        it("should contain English locale content", () => {
            expect(IMPRINT_LOCALE_MAP).toHaveProperty("en");
            expect(typeof IMPRINT_LOCALE_MAP.en).toBe("string");
        });

        it("should contain Spanish locale content", () => {
            expect(IMPRINT_LOCALE_MAP).toHaveProperty("es");
            expect(typeof IMPRINT_LOCALE_MAP.es).toBe("string");
        });

        it("should fall back to English when language is not available", () => {
            const unknownLanguage = "ww";
            const content = IMPRINT_LOCALE_MAP[unknownLanguage] || IMPRINT_LOCALE_MAP.en;
            expect(content).toBe(IMPRINT_LOCALE_MAP.en);
        });

        it("should return correct content for existing language", () => {
            const germanContent = IMPRINT_LOCALE_MAP.de;
            const fallbackContent = IMPRINT_LOCALE_MAP.de || IMPRINT_LOCALE_MAP.en;
            expect(fallbackContent).toBe(germanContent);
        });
    });

    describe("Locale key extraction", () => {
        it("should have correct locale keys extracted from file paths", () => {
            const localeKeys = Object.keys(IMPRINT_LOCALE_MAP);

            expect(localeKeys).toContain("de");
            expect(localeKeys).toContain("en");
            expect(localeKeys).toContain("es");
        });

        it("should not have file extension in locale keys", () => {
            const localeKeys = Object.keys(IMPRINT_LOCALE_MAP);

            for (const key of localeKeys) {
                expect(key).not.toContain(".md");
            }
        });

        it("should not have 'imprint-' prefix in locale keys", () => {
            const localeKeys = Object.keys(IMPRINT_LOCALE_MAP);

            for (const key of localeKeys) {
                expect(key).not.toContain("imprint-");
            }
        });
    });
});
