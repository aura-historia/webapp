import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { getComparisonFaq } from "@/features/comparison/config/comparisonDefinition.ts";
import { COMPARISON_REGISTRY } from "@/features/comparison/config/comparisonRegistry.ts";
import translationDE from "@/i18n/locales/de/translation.json";
import translationEN from "@/i18n/locales/en/translation.json";
import translationES from "@/i18n/locales/es/translation.json";
import translationFR from "@/i18n/locales/fr/translation.json";
import translationIT from "@/i18n/locales/it/translation.json";
import { STATIC_PAGES } from "@/lib/seo/staticPages.ts";

const LOCALES = {
    de: translationDE,
    en: translationEN,
    es: translationES,
    fr: translationFR,
    it: translationIT,
} as const;

const llmsTxt = readFileSync(resolve(process.cwd(), "public/llms.txt"), "utf8");

function lookup(resource: unknown, key: string): unknown {
    return key
        .split(".")
        .reduce<unknown>(
            (value, part) =>
                value && typeof value === "object"
                    ? (value as Record<string, unknown>)[part]
                    : undefined,
            resource,
        );
}

describe("COMPARISON_REGISTRY", () => {
    it("has unique slugs whose routes match", () => {
        const slugs = COMPARISON_REGISTRY.map((entry) => entry.slug);

        expect(new Set(slugs).size).toBe(slugs.length);
        for (const entry of COMPARISON_REGISTRY) {
            expect(entry.routePath).toBe(`/$lng/compare/${entry.slug}`);
        }
    });

    it("lists every comparison as an indexable static page and in llms.txt", () => {
        for (const entry of COMPARISON_REGISTRY) {
            expect(STATIC_PAGES).toContainEqual({
                path: `/compare/${entry.slug}`,
                indexable: true,
            });
            expect(llmsTxt).toContain(`(https://aura-historia.com/en/compare/${entry.slug})`);
        }
    });

    it("keeps a fixed ISO review date per page", () => {
        for (const entry of COMPARISON_REGISTRY) {
            expect(entry.lastReviewed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            expect(Number.isNaN(Date.parse(entry.lastReviewed))).toBe(false);
        }
    });

    it.each(Object.entries(LOCALES))(
        "has the meta, positioning and FAQ copy in %s",
        (_, locale) => {
            for (const entry of COMPARISON_REGISTRY) {
                expect(lookup(locale, `meta.${entry.metaKey}.title`)).toEqual(expect.any(String));
                expect(lookup(locale, `meta.${entry.metaKey}.description`)).toEqual(
                    expect.any(String),
                );
                expect(lookup(locale, entry.positioningKey)).toEqual(expect.any(String));
                expect(lookup(locale, `${entry.namespace}.scorecard.headers.competitor`)).toEqual(
                    expect.any(String),
                );
                for (const item of getComparisonFaq(entry)) {
                    expect(lookup(locale, item.questionKey)).toEqual(expect.any(String));
                    expect(lookup(locale, item.answerKey)).toEqual(expect.any(String));
                }
            }
        },
    );
});

describe("the shared AI-assistants copy", () => {
    const sharedCopy = (locale: (typeof LOCALES)[keyof typeof LOCALES]) =>
        JSON.stringify([locale.comparison.agents, locale.comparison.faq.aiAssistants]);

    it.each(Object.entries(LOCALES))("states the public MCP server facts in %s", (_, locale) => {
        expect(locale.comparison.agents.body).toContain("MCP");
        expect(locale.comparison.agents.body).toContain("REST");
        expect(locale.comparison.faq.aiAssistants.answer).toContain(
            "https://mcp.aura-historia.com/v1",
        );
    });

    it.each(Object.entries(LOCALES))(
        "names no assistant and makes no hype claim in %s",
        (_, locale) => {
            expect(sharedCopy(locale)).not.toMatch(
                /ChatGPT|Claude|Gemini|Copilot|Perplexity|Grok|cutting-edge|revolution|AI-powered/i,
            );
        },
    );

    it("compares nothing in English", () => {
        expect(sharedCopy(LOCALES.en)).not.toMatch(
            /\bunlike\b|\bonly\b|\bfirst\b|no other|always up to date|latest tech/i,
        );
    });
});
