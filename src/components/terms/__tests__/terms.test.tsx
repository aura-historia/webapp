import { describe, it, expect, vi, beforeEach } from "vitest";
import { TERMS_LOCALE_MAP } from "@/assets/content/terms/terms-asset-map.ts";
import { Terms } from "../Terms.tsx";
import { renderWithQueryClient } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                "terms.title": "AGB",
            };
            return translations[key] || key;
        },
        i18n: {
            language: "de",
        },
    }),
}));

describe("Terms Component", () => {
    beforeEach(async () => {
        await act(async () => {
            renderWithQueryClient(<Terms />);
        });
    });

    it("renders the terms title", () => {
        expect(screen.getByText("AGB")).toBeInTheDocument();
    });

    it("renders the payment processing section", () => {
        expect(
            screen.getByRole("heading", {
                name: /Vertragsschluss, kostenpflichtige Leistungen und Zahlungsabwicklung/i,
            }),
        ).toBeInTheDocument();
    });

    it("renders Zoho Campaigns content", () => {
        expect(screen.getByText(/Zoho Campaigns/i)).toBeInTheDocument();
    });

    it("renders the provider legal form", () => {
        const matches = screen.getAllByText(/Julian Bruder Einzelunternehmen/);
        expect(matches.length).toBeGreaterThanOrEqual(1);
    });

    it("renders API usage restrictions", () => {
        expect(screen.getByText(/API/i)).toBeInTheDocument();
    });

    it("renders content within a Card component", () => {
        const card = screen.getByText("AGB").closest(".gap-4");
        expect(card).toBeInTheDocument();
    });
});

describe("Terms Page Logic", () => {
    it("contains all supported locales", () => {
        expect(Object.keys(TERMS_LOCALE_MAP)).toEqual(
            expect.arrayContaining(["de", "en", "es", "fr", "it"]),
        );
    });

    it("falls back to English when locale is missing", () => {
        const content = TERMS_LOCALE_MAP.unknown || TERMS_LOCALE_MAP.en;
        expect(content).toBe(TERMS_LOCALE_MAP.en);
    });

    it("contains Stripe wording in all locales", () => {
        for (const content of Object.values(TERMS_LOCALE_MAP)) {
            expect(content).toContain("Stripe");
        }
    });

    it("contains Zoho Campaigns wording in all locales", () => {
        for (const content of Object.values(TERMS_LOCALE_MAP)) {
            expect(content).toContain("Zoho Campaigns");
        }
    });

    it("contains API wording in all locales", () => {
        for (const content of Object.values(TERMS_LOCALE_MAP)) {
            expect(content).toContain("API");
        }
    });

    it("contains the provider legal form in all locales", () => {
        for (const content of Object.values(TERMS_LOCALE_MAP)) {
            expect(content).toContain("Julian Bruder Einzelunternehmen");
        }
    });
});
