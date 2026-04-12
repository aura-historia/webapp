import { describe, expect, it, vi } from "vitest";
import { generatePeriodHeadMeta } from "../periodHeadMeta.ts";
import type { GetPeriodData } from "@/client";

vi.mock("@/i18n/i18n.ts", () => ({
    default: {
        exists: (key: string) => key === "period.descriptions.RENAISSANCE",
        t: (key: string) => {
            if (key === "meta.period.defaultName") return "Epoche";
            if (key === "meta.siteName") return "Aura Historia";
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

vi.mock("@/env", () => ({
    env: {
        VITE_APP_URL: "https://aura-historia.com",
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

describe("generatePeriodHeadMeta", () => {
    it("generates correct title and description", () => {
        const result = generatePeriodHeadMeta(mockPeriod, { periodId: "renaissance" });

        expect(result.meta).toContainEqual({
            title: "Renaissance | Aura Historia",
        });

        expect(result.meta).toContainEqual({
            name: "description",
            content:
                "Buyers searching for authentic Renaissance antiques for sale and early humanist art can discover period-defining artifacts from specialized dealers.",
        });
    });

    it("includes Open Graph tags", () => {
        const result = generatePeriodHeadMeta(mockPeriod, { periodId: "renaissance" });

        expect(result.meta).toContainEqual({
            property: "og:title",
            content: "Renaissance",
        });

        expect(result.meta).toContainEqual({
            property: "og:description",
            content:
                "Buyers searching for authentic Renaissance antiques for sale and early humanist art can discover period-defining artifacts from specialized dealers.",
        });
        expect(result.meta).toContainEqual({
            property: "og:url",
            content: "https://aura-historia.com/periods/renaissance",
        });

        expect(result.meta).toContainEqual({
            name: "twitter:description",
            content:
                "Buyers searching for authentic Renaissance antiques for sale and early humanist art can discover period-defining artifacts from specialized dealers.",
        });
    });

    it("includes canonical link", () => {
        const result = generatePeriodHeadMeta(mockPeriod, { periodId: "renaissance" });

        expect(result.links).toContainEqual({
            rel: "canonical",
            href: "https://aura-historia.com/periods/renaissance",
        });
    });

    it("uses default name if period name is missing", () => {
        const periodWithoutName: GetPeriodData = {
            ...mockPeriod,
            name: { text: "", language: "en" },
        };
        const result = generatePeriodHeadMeta(periodWithoutName, { periodId: "renaissance" });

        expect(result.meta).toContainEqual({
            title: "Epoche | Aura Historia",
        });
    });
});
