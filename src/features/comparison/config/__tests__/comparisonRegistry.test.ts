import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
    type ComparisonDefinition,
    getComparisonChapters,
    getComparisonFaq,
    getComparisonNav,
} from "@/features/comparison/config/comparisonDefinition.ts";
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

/** Every translation key a comparison page reads for its definition, shared keys included. */
function comparisonCopyKeys(definition: ComparisonDefinition): string[] {
    const ns = definition.namespace;
    const chapters = getComparisonChapters(definition);
    return [
        `meta.${definition.metaKey}.title`,
        `meta.${definition.metaKey}.description`,
        definition.positioningKey,
        ...[
            "eyebrow",
            "title",
            "subtitle",
            "primaryCta",
            "secondaryCta",
            "quickAnswerEyebrow",
            "quickAnswerTitle",
            "quickAnswerDescription",
        ].map((key) => `${ns}.hero.${key}`),
        ...definition.quickVerdicts.flatMap(({ key }) => [
            `${ns}.quickVerdicts.${key}.label`,
            `${ns}.quickVerdicts.${key}.value`,
        ]),
        `${ns}.summary.title`,
        `${ns}.summary.paragraph1`,
        `${ns}.summary.paragraph2`,
        `${ns}.respect.title`,
        `${ns}.respect.paragraph1`,
        `${ns}.respect.paragraph2`,
        ...(definition.statusNote ? [`${ns}.respect.status`] : []),
        `${ns}.advantages.title`,
        `${ns}.advantages.description`,
        ...definition.advantages.flatMap(({ key }) => [
            `${ns}.advantages.cards.${key}.title`,
            `${ns}.advantages.cards.${key}.description`,
        ]),
        ...["title", "description", "caption"].map((key) => `${ns}.scorecard.${key}`),
        ...["criterion", "competitor", "auraHistoria"].map(
            (key) => `${ns}.scorecard.headers.${key}`,
        ),
        ...definition.scorecardRows.flatMap(({ key }) =>
            ["criterion", "competitor", "auraHistoria", "verdict"].map(
                (field) => `${ns}.scorecard.rows.${key}.${field}`,
            ),
        ),
        ...(definition.sources
            ? [
                  `${ns}.downstream.title`,
                  `${ns}.downstream.sourcesLabel`,
                  ...definition.sources.sourceKeys.map((key) => `${ns}.downstream.sources.${key}`),
                  ...definition.sources.cards.flatMap(({ key }) => [
                      `${ns}.downstream.cards.${key}.title`,
                      `${ns}.downstream.cards.${key}.description`,
                  ]),
              ]
            : []),
        ...(definition.alerts
            ? [`${ns}.alerts.title`, `${ns}.alerts.paragraph1`, `${ns}.alerts.paragraph2`]
            : []),
        ...(definition.together
            ? [`${ns}.together.title`, `${ns}.together.paragraph1`, `${ns}.together.paragraph2`]
            : []),
        `${ns}.faq.title`,
        ...getComparisonFaq(definition).flatMap((item) => [item.questionKey, item.answerKey]),
        ...["title", "description", "button"].map((key) => `${ns}.finalCta.${key}`),
        ...getComparisonNav(definition).map((item) => item.labelKey),
        ...chapters.filter((id) => id !== "respect").map((id) => `${ns}.nav.items.${id}`),
        ...definition.structuredDataTopics.map((topic) => `${ns}.structuredData.about.${topic}`),
    ];
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

    it.each(Object.entries(LOCALES))("has every key the definition reads in %s", (_, locale) => {
        for (const entry of COMPARISON_REGISTRY) {
            const missing = comparisonCopyKeys(entry).filter(
                (key) => typeof lookup(locale, key) !== "string",
            );
            expect(missing).toEqual([]);
        }
    });
});
