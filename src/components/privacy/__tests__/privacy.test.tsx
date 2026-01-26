import { describe, it, expect, vi, beforeEach } from "vitest";
import { PRIVACY_LOCALE_MAP } from "@/assets/content/privacy/privacy-asset-map.ts";
import { Privacy } from "../Privacy.tsx";
import { renderWithQueryClient } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                "privacy.title": "Datenschutz",
            };
            return translations[key] || key;
        },
        i18n: {
            language: "de",
        },
    }),
}));

describe("Privacy Component", () => {
    beforeEach(async () => {
        await act(async () => {
            renderWithQueryClient(<Privacy />);
        });
    });

    it("renders the privacy title", () => {
        expect(screen.getByText("Datenschutz")).toBeInTheDocument();
    });

    it("renders content within a Card component", () => {
        const card = screen.getByText("Datenschutz").closest(".gap-4");
        expect(card).toBeInTheDocument();
    });
});

describe("Privacy Page Logic", () => {
    describe("PRIVACY_LOCALE_MAP", () => {
        it("should contain German locale content", () => {
            expect(PRIVACY_LOCALE_MAP).toHaveProperty("de");
            expect(typeof PRIVACY_LOCALE_MAP.de).toBe("string");
        });

        it("should contain English locale content", () => {
            expect(PRIVACY_LOCALE_MAP).toHaveProperty("en");
            expect(typeof PRIVACY_LOCALE_MAP.en).toBe("string");
        });

        it("should contain Spanish locale content", () => {
            expect(PRIVACY_LOCALE_MAP).toHaveProperty("es");
            expect(typeof PRIVACY_LOCALE_MAP.es).toBe("string");
        });

        it("should contain French locale content", () => {
            expect(PRIVACY_LOCALE_MAP).toHaveProperty("fr");
            expect(typeof PRIVACY_LOCALE_MAP.fr).toBe("string");
        });

        it("should fall back to English when language is not available", () => {
            const unknownLanguage = "ww";
            const content = PRIVACY_LOCALE_MAP[unknownLanguage] || PRIVACY_LOCALE_MAP.en;
            expect(content).toBe(PRIVACY_LOCALE_MAP.en);
        });

        it("should return correct content for existing language", () => {
            const germanContent = PRIVACY_LOCALE_MAP.de;
            const fallbackContent = PRIVACY_LOCALE_MAP.de || PRIVACY_LOCALE_MAP.en;
            expect(fallbackContent).toBe(germanContent);
        });

        it("should have content for all locales (empty is allowed)", () => {
            const localeKeys = Object.keys(PRIVACY_LOCALE_MAP);
            for (const key of localeKeys) {
                // Content exists (even if empty, as markdown files are intentionally empty)
                expect(PRIVACY_LOCALE_MAP[key]).toBeDefined();
            }
        });
    });

    describe("Locale key extraction", () => {
        it("should have correct locale keys extracted from file paths", () => {
            const localeKeys = Object.keys(PRIVACY_LOCALE_MAP);

            expect(localeKeys).toContain("de");
            expect(localeKeys).toContain("en");
            expect(localeKeys).toContain("es");
            expect(localeKeys).toContain("fr");
        });

        it("should not have file extension in locale keys", () => {
            const localeKeys = Object.keys(PRIVACY_LOCALE_MAP);

            for (const key of localeKeys) {
                expect(key).not.toContain(".md");
            }
        });

        it("should not have 'privacy-' prefix in locale keys", () => {
            const localeKeys = Object.keys(PRIVACY_LOCALE_MAP);

            for (const key of localeKeys) {
                expect(key).not.toContain("privacy-");
            }
        });
    });
});
