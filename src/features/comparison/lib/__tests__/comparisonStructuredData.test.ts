import { beforeAll, describe, expect, it } from "vitest";

import { BARNEBYS_COMPARISON } from "@/features/comparison/config/barnebysComparison.ts";
import { BARNEBYS_COMPARISON_LAST_REVIEWED } from "@/features/comparison/config/barnebysComparisonReview.ts";
import type { ComparisonDefinition } from "@/features/comparison/config/comparisonDefinition.ts";
import {
    buildComparisonStructuredData,
    stripInlineMarkup,
} from "@/features/comparison/lib/comparisonStructuredData.ts";
import {
    FIXTURE_COMPARISON,
    FIXTURE_COMPETITOR,
    registerFixtureTranslations,
} from "@/features/comparison/pages/__tests__/comparisonFixture.ts";
import testI18n from "@/i18n/i18nForTests";

const t = testI18n.t.bind(testI18n);

function build(definition: ComparisonDefinition = BARNEBYS_COMPARISON) {
    return buildComparisonStructuredData({
        definition,
        t,
        siteUrl: "https://aura-historia.com",
        pageUrl: `https://aura-historia.com/de/compare/${definition.slug}`,
        language: "de",
    });
}

beforeAll(() => {
    registerFixtureTranslations();
});

describe("buildComparisonStructuredData", () => {
    it("describes the page as an article with the fixed review date and a plain headline", () => {
        const [article] = build();

        expect(article).toMatchObject({
            "@type": "Article",
            headline: "Mehr vom Kunst- und Antiquitätenmarkt sehen als nur Auktionskataloge",
            description: t("compareBarnebysPage.hero.subtitle"),
            dateModified: BARNEBYS_COMPARISON_LAST_REVIEWED,
            inLanguage: "de",
            url: "https://aura-historia.com/de/compare/barnebys",
            publisher: { "@type": "Organization", name: "Aura Historia" },
        });
        expect(article.about).toHaveLength(5);
    });

    it("emits the visible questions and answers as an FAQPage, the AI-assistants item last", () => {
        const [, faqPage] = build();

        expect(faqPage.mainEntity).toHaveLength(BARNEBYS_COMPARISON.faqItems.length + 1);
        expect(faqPage.mainEntity[0]).toEqual({
            "@type": "Question",
            name: t("compareBarnebysPage.faq.items.alternative.question"),
            acceptedAnswer: {
                "@type": "Answer",
                text: t("compareBarnebysPage.faq.items.alternative.answer"),
            },
        });
        expect(faqPage.mainEntity.at(-1)).toEqual({
            "@type": "Question",
            name: t("comparison.faq.aiAssistants.question"),
            acceptedAnswer: {
                "@type": "Answer",
                text: t("comparison.faq.aiAssistants.answer"),
            },
        });
    });

    it("builds from any definition: its namespace, topics, FAQ and review date", () => {
        const [article, faqPage] = build(FIXTURE_COMPARISON);

        expect(article.headline).toBe(`Aura Historia und ${FIXTURE_COMPETITOR}`);
        expect(article.dateModified).toBe("2026-01-15");
        expect(article.url).toBe("https://aura-historia.com/de/compare/beispielhaus");
        expect(article.about).toEqual([
            t("compareFixturePage.structuredData.about.searchEngine"),
            t("compareFixturePage.structuredData.about.aiDiscovery"),
        ]);
        expect(faqPage.mainEntity.map((entry) => entry.name)).toEqual([
            t("compareFixturePage.faq.items.alternative.question"),
            t("comparison.faq.aiAssistants.question"),
        ]);
    });

    it("strips inline emphasis", () => {
        expect(stripInlineMarkup("The short <em>version</em>")).toBe("The short version");
        expect(stripInlineMarkup("<strong>Verdict:</strong> choose")).toBe("Verdict: choose");
    });
});
