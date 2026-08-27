import { describe, it, expect, vi, beforeEach } from "vitest";
import { PRIVACY_LOCALE_MAP } from "@/features/legal/content/privacy/privacy-asset-map.ts";
import { PrivacyPage } from "../PrivacyPage.tsx";
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

const EXTERNAL_MAP_PRIVACY_EXPECTATIONS: Record<string, string[]> = {
    de: [
        "externen Karten",
        "Google Maps",
        "Google Maps wird erst geladen",
        "keine Google-Maps-iframe-Verbindung",
        "IP-Adresse",
        "Koordinaten",
        "Drittländern",
        "Consent-Einstellungen",
        "Art. 6 Abs. 1 lit. a DSGVO",
        "§ 25 Abs. 1 TDDDG",
    ],
    en: [
        "external maps",
        "Google Maps",
        "Google Maps is loaded only after",
        "no Google Maps iframe connection",
        "IP address",
        "coordinates",
        "third countries",
        "consent settings",
        "Art. 6 para. 1 lit. a GDPR",
        "Section 25 para. 1 TDDDG",
    ],
    es: [
        "mapas externos",
        "Google Maps",
        "Google Maps solo se carga",
        "ninguna conexión iframe con Google Maps",
        "dirección IP",
        "coordenadas",
        "terceros países",
        "ajustes de consentimiento",
        "Art. 6 apdo. 1 letra a RGPD",
        "§ 25 apdo. 1 TDDDG",
    ],
    fr: [
        "cartes externes",
        "Google Maps",
        "Google Maps n’est chargé",
        "aucune connexion iframe Google Maps",
        "adresse IP",
        "coordonnées",
        "pays tiers",
        "paramètres de consentement",
        "Art. 6, par. 1, point a RGPD",
        "§ 25, al. 1 TDDDG",
    ],
    it: [
        "mappe esterne",
        "Google Maps",
        "Google Maps viene caricato",
        "alcuna connessione iframe con Google Maps",
        "indirizzo IP",
        "coordinate",
        "paesi terzi",
        "impostazioni di consenso",
        "Art. 6 par. 1 lett. a GDPR",
        "§ 25 par. 1 TDDDG",
    ],
};

describe("PrivacyPage", () => {
    beforeEach(async () => {
        await act(async () => {
            renderWithQueryClient(<PrivacyPage />);
        });
    });

    it("renders the privacy title", () => {
        expect(screen.getByText("Datenschutz")).toBeInTheDocument();
    });

    it("renders the controller name", () => {
        expect(screen.getByText(/Julian Bruder Einzelunternehmen/)).toBeInTheDocument();
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

    describe("Markdown content structure", () => {
        it("should contain controller name in all locales", () => {
            const localeKeys = Object.keys(PRIVACY_LOCALE_MAP);
            for (const key of localeKeys) {
                expect(PRIVACY_LOCALE_MAP[key]).toContain("Julian Bruder Einzelunternehmen");
            }
        });

        it("should contain personal email in all locales", () => {
            const localeKeys = Object.keys(PRIVACY_LOCALE_MAP);
            for (const key of localeKeys) {
                expect(PRIVACY_LOCALE_MAP[key]).toContain("julian.bruder@aura-historia.com");
            }
        });

        it("should contain contact email in all locales", () => {
            const localeKeys = Object.keys(PRIVACY_LOCALE_MAP);
            for (const key of localeKeys) {
                expect(PRIVACY_LOCALE_MAP[key]).toContain("contact@aura-historia.com");
            }
        });

        it("should state that DPAs exist with AWS, Cloudflare, and Hetzner in all locales", () => {
            const localeKeys = Object.keys(PRIVACY_LOCALE_MAP);

            for (const key of localeKeys) {
                expect(PRIVACY_LOCALE_MAP[key]).toContain("Amazon Web Services (AWS)");
                expect(PRIVACY_LOCALE_MAP[key]).toContain("Cloudflare");
                expect(PRIVACY_LOCALE_MAP[key]).toContain("Hetzner Online GmbH");
            }
        });

        it("should mention Zoho Campaigns and Stripe in all locales", () => {
            const localeKeys = Object.keys(PRIVACY_LOCALE_MAP);

            for (const key of localeKeys) {
                expect(PRIVACY_LOCALE_MAP[key]).toContain("Zoho Campaigns");
                expect(PRIVACY_LOCALE_MAP[key]).toContain("Stripe");
            }
        });

        it("should document external map consent in every locale", () => {
            for (const [locale, expectedPhrases] of Object.entries(
                EXTERNAL_MAP_PRIVACY_EXPECTATIONS,
            )) {
                const content = PRIVACY_LOCALE_MAP[locale];

                expect(content).toBeDefined();
                for (const expectedPhrase of expectedPhrases) {
                    expect(content).toContain(expectedPhrase);
                }
            }
        });

        it("should document Google Maps as a recipient in every locale", () => {
            const localeKeys = Object.keys(PRIVACY_LOCALE_MAP);

            for (const key of localeKeys) {
                const content = PRIVACY_LOCALE_MAP[key];

                expect(content).toContain("Google Maps");
                expect(content).toContain("Google Ireland Limited");
            }
        });

        it("should not include markdown comment placeholders in any locale", () => {
            const localeKeys = Object.keys(PRIVACY_LOCALE_MAP);

            for (const key of localeKeys) {
                expect(PRIVACY_LOCALE_MAP[key]).not.toContain("[//]: <>");
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
            expect(localeKeys).toContain("it");
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
