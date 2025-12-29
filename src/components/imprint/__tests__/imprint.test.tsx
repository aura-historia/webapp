import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Markdown from "react-markdown";
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
            expect(IMPRINT_LOCALE_MAP.de.length).toBeGreaterThan(0);
        });

        it("should contain English locale content", () => {
            expect(IMPRINT_LOCALE_MAP).toHaveProperty("en");
            expect(typeof IMPRINT_LOCALE_MAP.en).toBe("string");
            expect(IMPRINT_LOCALE_MAP.en.length).toBeGreaterThan(0);
        });

        it("should contain Spanish locale content", () => {
            expect(IMPRINT_LOCALE_MAP).toHaveProperty("es");
            expect(typeof IMPRINT_LOCALE_MAP.es).toBe("string");
            expect(IMPRINT_LOCALE_MAP.es.length).toBeGreaterThan(0);
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

    describe("Markdown content rendering", () => {
        it("should render German imprint content with markdown", async () => {
            await act(async () => {
                render(<Markdown>{IMPRINT_LOCALE_MAP.de}</Markdown>);
            });

            // Check for company name heading
            expect(screen.getByText("Company Name GmbH")).toBeInTheDocument();
        });

        it("should render English imprint content with markdown", async () => {
            await act(async () => {
                render(<Markdown>{IMPRINT_LOCALE_MAP.en}</Markdown>);
            });

            expect(screen.getByText("Company Name GmbH")).toBeInTheDocument();
        });

        it("should render contact information from markdown", async () => {
            await act(async () => {
                render(<Markdown>{IMPRINT_LOCALE_MAP.de}</Markdown>);
            });

            expect(screen.getByText(/Phone:/)).toBeInTheDocument();
            expect(screen.getByText(/Email:/)).toBeInTheDocument();
        });

        it("should render links from markdown content", async () => {
            await act(async () => {
                render(<Markdown>{IMPRINT_LOCALE_MAP.en}</Markdown>);
            });

            const link = screen.getByRole("link", { name: /John Doe/i });
            expect(link).toBeInTheDocument();
            expect(link).toHaveAttribute("href", "https://aura-historia.com");
        });

        it("should render disclaimer section from markdown", async () => {
            await act(async () => {
                render(<Markdown>{IMPRINT_LOCALE_MAP.de}</Markdown>);
            });

            expect(screen.getByText("Disclaimer")).toBeInTheDocument();
            expect(screen.getByText(/Liability for Content/)).toBeInTheDocument();
            expect(screen.getByText(/Liability for Links/)).toBeInTheDocument();
            expect(screen.getByText(/Copyright/)).toBeInTheDocument();
        });

        it("should render VAT ID information", async () => {
            await act(async () => {
                render(<Markdown>{IMPRINT_LOCALE_MAP.de}</Markdown>);
            });

            expect(screen.getByText(/VAT ID/)).toBeInTheDocument();
            expect(screen.getByText(/DE123456789/)).toBeInTheDocument();
        });

        it("should render register entry information", async () => {
            await act(async () => {
                render(<Markdown>{IMPRINT_LOCALE_MAP.de}</Markdown>);
            });

            expect(screen.getByText(/Register Entry/)).toBeInTheDocument();
            expect(screen.getByText(/HRB 123456/)).toBeInTheDocument();
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
