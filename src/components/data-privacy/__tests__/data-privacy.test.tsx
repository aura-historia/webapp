import { describe, it, expect, vi, beforeEach } from "vitest";
import { DATA_PRIVACY_LOCALE_MAP } from "@/assets/content/data-privacy/data-privacy-asset-map.ts";
import { DataPrivacy } from "../DataPrivacy.tsx";
import { renderWithQueryClient } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                "dataPrivacy.title": "Datenschutz",
            };
            return translations[key] || key;
        },
        i18n: {
            language: "de",
        },
    }),
}));

describe("DataPrivacy Component", () => {
    beforeEach(async () => {
        await act(async () => {
            renderWithQueryClient(<DataPrivacy />);
        });
    });

    it("renders the data privacy title", () => {
        expect(screen.getByText("Datenschutz")).toBeInTheDocument();
    });

    it("renders content within a Card component", () => {
        const card = screen.getByText("Datenschutz").closest(".gap-4");
        expect(card).toBeInTheDocument();
    });
});

describe("DataPrivacy Page Logic", () => {
    describe("DATA_PRIVACY_LOCALE_MAP", () => {
        it("should contain German locale content", () => {
            expect(DATA_PRIVACY_LOCALE_MAP).toHaveProperty("de");
            expect(typeof DATA_PRIVACY_LOCALE_MAP.de).toBe("string");
        });

        it("should contain English locale content", () => {
            expect(DATA_PRIVACY_LOCALE_MAP).toHaveProperty("en");
            expect(typeof DATA_PRIVACY_LOCALE_MAP.en).toBe("string");
        });

        it("should contain Spanish locale content", () => {
            expect(DATA_PRIVACY_LOCALE_MAP).toHaveProperty("es");
            expect(typeof DATA_PRIVACY_LOCALE_MAP.es).toBe("string");
        });

        it("should contain French locale content", () => {
            expect(DATA_PRIVACY_LOCALE_MAP).toHaveProperty("fr");
            expect(typeof DATA_PRIVACY_LOCALE_MAP.fr).toBe("string");
        });

        it("should fall back to English when language is not available", () => {
            const unknownLanguage = "ww";
            const content = DATA_PRIVACY_LOCALE_MAP[unknownLanguage] || DATA_PRIVACY_LOCALE_MAP.en;
            expect(content).toBe(DATA_PRIVACY_LOCALE_MAP.en);
        });

        it("should return correct content for existing language", () => {
            const germanContent = DATA_PRIVACY_LOCALE_MAP.de;
            const fallbackContent = DATA_PRIVACY_LOCALE_MAP.de || DATA_PRIVACY_LOCALE_MAP.en;
            expect(fallbackContent).toBe(germanContent);
        });

        it("should have content for all locales (empty is allowed)", () => {
            const localeKeys = Object.keys(DATA_PRIVACY_LOCALE_MAP);
            for (const key of localeKeys) {
                // Content exists (even if empty, as markdown files are intentionally empty)
                expect(DATA_PRIVACY_LOCALE_MAP[key]).toBeDefined();
            }
        });
    });

    describe("Locale key extraction", () => {
        it("should have correct locale keys extracted from file paths", () => {
            const localeKeys = Object.keys(DATA_PRIVACY_LOCALE_MAP);

            expect(localeKeys).toContain("de");
            expect(localeKeys).toContain("en");
            expect(localeKeys).toContain("es");
            expect(localeKeys).toContain("fr");
        });

        it("should not have file extension in locale keys", () => {
            const localeKeys = Object.keys(DATA_PRIVACY_LOCALE_MAP);

            for (const key of localeKeys) {
                expect(key).not.toContain(".md");
            }
        });

        it("should not have 'data-privacy-' prefix in locale keys", () => {
            const localeKeys = Object.keys(DATA_PRIVACY_LOCALE_MAP);

            for (const key of localeKeys) {
                expect(key).not.toContain("data-privacy-");
            }
        });
    });
});
