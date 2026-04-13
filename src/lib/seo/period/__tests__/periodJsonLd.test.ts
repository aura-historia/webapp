import { describe, expect, it, vi } from "vitest";
import type { GetPeriodData } from "@/client";
import { generatePeriodJsonLd, generatePeriodJsonLdScript } from "../periodJsonLd.ts";

vi.mock("@/i18n/i18n.ts", () => ({
    default: {
        exists: (key: string) => key === "period.descriptions.RENAISSANCE",
        t: (key: string) => {
            if (key === "period.descriptions.RENAISSANCE") {
                return "Buyers searching for authentic Renaissance antiques for sale and early humanist art can discover period-defining artifacts from specialized dealers.";
            }
            if (key === "period.header.defaultDescription") {
                return "Explore curated objects from this era and discover their historical context.";
            }
            return key;
        },
    },
}));

const mockPeriod: GetPeriodData = {
    periodId: "renaissance",
    periodKey: "RENAISSANCE",
    name: { text: "Renaissance", language: "en" },
    products: 200,
    created: "2024-01-15T08:00:00Z",
    updated: "2024-06-20T12:30:00Z",
};

describe("periodJsonLd", () => {
    it("uses localized period description in JSON-LD", () => {
        const result = generatePeriodJsonLd(
            mockPeriod,
            "https://aura-historia.com/periods/renaissance",
        );

        expect(result.description).toBe(
            "Buyers searching for authentic Renaissance antiques for sale and early humanist art can discover period-defining artifacts from specialized dealers.",
        );
    });

    it("serializes JSON-LD output as JSON", () => {
        const scriptContent = generatePeriodJsonLdScript(
            mockPeriod,
            "https://aura-historia.com/periods/renaissance",
        );

        expect(() => JSON.parse(scriptContent)).not.toThrow();
    });
});
