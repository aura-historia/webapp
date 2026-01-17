import { describe, it, expect, vi, beforeEach } from "vitest";
import { IMPRINT_LOCALE_MAP } from "@/assets/content/imprint/imprint-asset-map.ts";
import { Imprint } from "../Imprint.tsx";
import { renderWithQueryClient } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";

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

describe("Imprint Component", () => {
    beforeEach(async () => {
        await act(async () => {
            renderWithQueryClient(<Imprint />);
        });
    });

    it("renders the imprint title", () => {
        expect(screen.getByText("Impressum")).toBeInTheDocument();
    });

    it("renders the markdown content", () => {
        // Check for key content from the German imprint
        expect(screen.getByText("Diensteanbieter")).toBeInTheDocument();
    });

    it("renders the service provider name", () => {
        expect(screen.getByText("Aura Historia")).toBeInTheDocument();
    });

    it("renders contact information with email link", () => {
        const emailLinks = screen.getAllByRole("link", { name: /contact@aura-historia.com/i });
        expect(emailLinks.length).toBeGreaterThan(0);
        expect(emailLinks[0]).toHaveAttribute("href", "mailto:contact@aura-historia.com");
    });

    it("renders main section headings", () => {
        expect(screen.getByText("Art des Dienstes")).toBeInTheDocument();
        expect(screen.getByText("Inhaltliche Ausrichtung")).toBeInTheDocument();
    });

    it("renders legal section headings", () => {
        expect(screen.getByText("Haftung für Inhalte")).toBeInTheDocument();
        expect(screen.getByText("Urheberrecht")).toBeInTheDocument();
        expect(screen.getByText("Anwendbares Recht")).toBeInTheDocument();
    });

    it("renders content within a Card component", () => {
        const card = screen.getByText("Impressum").closest(".gap-4");
        expect(card).toBeInTheDocument();
    });

    it("applies correct markdown styles to links", () => {
        const emailLinks = screen.getAllByRole("link", { name: /contact@aura-historia.com/i });
        expect(emailLinks.length).toBeGreaterThan(0);
        for (const link of emailLinks) {
            expect(link).toHaveClass("underline");
        }
    });
});

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

        it("should contain French locale content", () => {
            expect(IMPRINT_LOCALE_MAP).toHaveProperty("fr");
            expect(typeof IMPRINT_LOCALE_MAP.fr).toBe("string");
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

        it("should have non-empty content for all locales", () => {
            const localeKeys = Object.keys(IMPRINT_LOCALE_MAP);
            for (const key of localeKeys) {
                expect(IMPRINT_LOCALE_MAP[key]).toBeTruthy();
                expect(IMPRINT_LOCALE_MAP[key].length).toBeGreaterThan(0);
            }
        });
    });

    describe("Locale key extraction", () => {
        it("should have correct locale keys extracted from file paths", () => {
            const localeKeys = Object.keys(IMPRINT_LOCALE_MAP);

            expect(localeKeys).toContain("de");
            expect(localeKeys).toContain("en");
            expect(localeKeys).toContain("es");
            expect(localeKeys).toContain("fr");
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

    describe("Markdown content structure", () => {
        it("should contain expected sections in German content", () => {
            const germanContent = IMPRINT_LOCALE_MAP.de;
            expect(germanContent).toContain("Diensteanbieter");
            expect(germanContent).toContain("Art des Dienstes");
            expect(germanContent).toContain("Inhaltliche Ausrichtung");
            expect(germanContent).toContain("Haftung für Inhalte");
        });

        it("should contain expected sections in English content", () => {
            const englishContent = IMPRINT_LOCALE_MAP.en;
            expect(englishContent).toContain("Service Provider");
            expect(englishContent).toContain("Type of Service");
            expect(englishContent).toContain("Content Orientation");
            expect(englishContent).toContain("Liability for Content");
        });

        it("should contain contact email in all locales", () => {
            const localeKeys = Object.keys(IMPRINT_LOCALE_MAP);
            for (const key of localeKeys) {
                expect(IMPRINT_LOCALE_MAP[key]).toContain("contact@aura-historia.com");
            }
        });

        it("should contain service name in all locales", () => {
            const localeKeys = Object.keys(IMPRINT_LOCALE_MAP);
            for (const key of localeKeys) {
                expect(IMPRINT_LOCALE_MAP[key]).toContain("Aura Historia");
            }
        });
    });
});
