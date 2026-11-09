import { beforeAll, describe, expect, it } from "vitest";

import { ART_PRICE_DATABASES_COMPARISON } from "@/features/comparison/config/artPriceDatabasesComparison.ts";
import { ART_PRICE_DATABASES_COMPARISON_LAST_REVIEWED } from "@/features/comparison/config/artPriceDatabasesComparisonReview.ts";
import { ARTSY_COMPARISON } from "@/features/comparison/config/artsyComparison.ts";
import { ARTSY_COMPARISON_LAST_REVIEWED } from "@/features/comparison/config/artsyComparisonReview.ts";
import { BARNEBYS_COMPARISON } from "@/features/comparison/config/barnebysComparison.ts";
import { BARNEBYS_COMPARISON_LAST_REVIEWED } from "@/features/comparison/config/barnebysComparisonReview.ts";
import { CATAWIKI_COMPARISON } from "@/features/comparison/config/catawikiComparison.ts";
import { CATAWIKI_COMPARISON_LAST_REVIEWED } from "@/features/comparison/config/catawikiComparisonReview.ts";
import {
    type ComparisonDefinition,
    getComparisonFaq,
} from "@/features/comparison/config/comparisonDefinition.ts";
import { EBAY_COMPARISON } from "@/features/comparison/config/ebayComparison.ts";
import { EBAY_COMPARISON_LAST_REVIEWED } from "@/features/comparison/config/ebayComparisonReview.ts";
import { FIRST_DIBS_COMPARISON } from "@/features/comparison/config/firstDibsComparison.ts";
import { FIRST_DIBS_COMPARISON_LAST_REVIEWED } from "@/features/comparison/config/firstDibsComparisonReview.ts";
import { INVALUABLE_COMPARISON } from "@/features/comparison/config/invaluableComparison.ts";
import { INVALUABLE_COMPARISON_LAST_REVIEWED } from "@/features/comparison/config/invaluableComparisonReview.ts";
import { LIVE_AUCTIONEERS_COMPARISON } from "@/features/comparison/config/liveAuctioneersComparison.ts";
import { LIVE_AUCTIONEERS_COMPARISON_LAST_REVIEWED } from "@/features/comparison/config/liveAuctioneersComparisonReview.ts";
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

    it("emits the visible questions and answers as an FAQPage", () => {
        const [, faqPage] = build();

        expect(faqPage.mainEntity).toHaveLength(BARNEBYS_COMPARISON.faqItems.length);
        expect(faqPage.mainEntity[0]).toEqual({
            "@type": "Question",
            name: t("compareBarnebysPage.faq.items.alternative.question"),
            acceptedAnswer: {
                "@type": "Answer",
                text: t("compareBarnebysPage.faq.items.alternative.answer"),
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
        ]);
    });

    it("builds the Artsy page from its visible strings, with no review markup", () => {
        const [article, faqPage] = build(ARTSY_COMPARISON);

        expect(article).toMatchObject({
            "@type": "Article",
            headline: stripInlineMarkup(t("compareArtsyPage.hero.title")),
            description: t("compareArtsyPage.hero.subtitle"),
            dateModified: ARTSY_COMPARISON_LAST_REVIEWED,
            url: "https://aura-historia.com/de/compare/artsy",
        });
        expect(article.dateModified).toBe("2026-11-08");
        expect(article.about).toEqual(
            ARTSY_COMPARISON.structuredDataTopics.map((topic) =>
                t(`compareArtsyPage.structuredData.about.${topic}`),
            ),
        );
        expect(faqPage.mainEntity.map((entry) => entry.name)).toEqual(
            getComparisonFaq(ARTSY_COMPARISON).map((item) => t(item.questionKey)),
        );
        expect(JSON.stringify([article, faqPage])).not.toMatch(
            /"@type":"(Review|AggregateRating|Rating)"/,
        );
    });

    it("builds the Invaluable page from its visible strings, with no review markup", () => {
        const [article, faqPage] = build(INVALUABLE_COMPARISON);

        expect(article).toMatchObject({
            "@type": "Article",
            headline: stripInlineMarkup(t("compareInvaluablePage.hero.title")),
            description: t("compareInvaluablePage.hero.subtitle"),
            dateModified: INVALUABLE_COMPARISON_LAST_REVIEWED,
            url: "https://aura-historia.com/de/compare/invaluable",
        });
        expect(article.dateModified).toBe("2026-11-08");
        expect(article.about).toEqual(
            INVALUABLE_COMPARISON.structuredDataTopics.map((topic) =>
                t(`compareInvaluablePage.structuredData.about.${topic}`),
            ),
        );
        expect(faqPage.mainEntity.map((entry) => entry.name)).toEqual(
            getComparisonFaq(INVALUABLE_COMPARISON).map((item) => t(item.questionKey)),
        );
        expect(faqPage.mainEntity).toHaveLength(5);
        expect(faqPage.mainEntity.at(-1)?.acceptedAnswer.text).toBe(
            t("compareInvaluablePage.faq.items.auctionZip.answer"),
        );
        expect(JSON.stringify([article, faqPage])).not.toMatch(
            /"@type":"(Review|AggregateRating|Rating)"/,
        );
    });

    it("builds the 1stDibs page from its visible strings, with no review markup", () => {
        const [article, faqPage] = build(FIRST_DIBS_COMPARISON);

        expect(article).toMatchObject({
            "@type": "Article",
            headline: stripInlineMarkup(t("compare1stdibsPage.hero.title")),
            description: t("compare1stdibsPage.hero.subtitle"),
            dateModified: FIRST_DIBS_COMPARISON_LAST_REVIEWED,
            url: "https://aura-historia.com/de/compare/1stdibs",
        });
        expect(article.dateModified).toBe("2026-11-08");
        expect(article.about).toEqual(
            FIRST_DIBS_COMPARISON.structuredDataTopics.map((topic) =>
                t(`compare1stdibsPage.structuredData.about.${topic}`),
            ),
        );
        expect(faqPage.mainEntity.map((entry) => entry.name)).toEqual(
            getComparisonFaq(FIRST_DIBS_COMPARISON).map((item) => t(item.questionKey)),
        );
        expect(faqPage.mainEntity).toHaveLength(4);
        expect(faqPage.mainEntity.at(-1)?.acceptedAnswer.text).toBe(
            t("compare1stdibsPage.faq.items.comparePrices.answer"),
        );
        expect(JSON.stringify([article, faqPage])).not.toMatch(
            /"@type":"(Review|AggregateRating|Rating)"/,
        );
    });

    it("builds the LiveAuctioneers page from its visible strings, with no review markup", () => {
        const [article, faqPage] = build(LIVE_AUCTIONEERS_COMPARISON);

        expect(article).toMatchObject({
            "@type": "Article",
            headline: stripInlineMarkup(t("compareLiveauctioneersPage.hero.title")),
            description: t("compareLiveauctioneersPage.hero.subtitle"),
            dateModified: LIVE_AUCTIONEERS_COMPARISON_LAST_REVIEWED,
            url: "https://aura-historia.com/de/compare/liveauctioneers",
        });
        expect(article.dateModified).toBe("2026-11-09");
        expect(article.about).toEqual(
            LIVE_AUCTIONEERS_COMPARISON.structuredDataTopics.map((topic) =>
                t(`compareLiveauctioneersPage.structuredData.about.${topic}`),
            ),
        );
        expect(faqPage.mainEntity.map((entry) => entry.name)).toEqual(
            getComparisonFaq(LIVE_AUCTIONEERS_COMPARISON).map((item) => t(item.questionKey)),
        );
        expect(faqPage.mainEntity).toHaveLength(5);
        // One question per brand, so each "<brand> alternative" query finds its own entry.
        expect(faqPage.mainEntity.map((entry) => entry.name).slice(0, 3)).toEqual([
            t("compareLiveauctioneersPage.faq.items.alternative.question"),
            t("compareLiveauctioneersPage.faq.items.saleroomAlternative.question"),
            t("compareLiveauctioneersPage.faq.items.lotTissimoAlternative.question"),
        ]);
        expect(faqPage.mainEntity.at(-1)?.acceptedAnswer.text).toBe(
            t("compareLiveauctioneersPage.faq.items.related.answer"),
        );
        expect(JSON.stringify([article, faqPage])).not.toMatch(
            /"@type":"(Review|AggregateRating|Rating)"/,
        );
    });

    it("builds the Catawiki page from its visible strings, with no review markup", () => {
        const [article, faqPage] = build(CATAWIKI_COMPARISON);

        expect(article).toMatchObject({
            "@type": "Article",
            headline: stripInlineMarkup(t("compareCatawikiPage.hero.title")),
            description: t("compareCatawikiPage.hero.subtitle"),
            dateModified: CATAWIKI_COMPARISON_LAST_REVIEWED,
            url: "https://aura-historia.com/de/compare/catawiki",
        });
        expect(article.dateModified).toBe("2026-11-09");
        expect(article.about).toEqual(
            CATAWIKI_COMPARISON.structuredDataTopics.map((topic) =>
                t(`compareCatawikiPage.structuredData.about.${topic}`),
            ),
        );
        expect(faqPage.mainEntity.map((entry) => entry.name)).toEqual(
            getComparisonFaq(CATAWIKI_COMPARISON).map((item) => t(item.questionKey)),
        );
        expect(faqPage.mainEntity).toHaveLength(5);
        // The questions people ask, in the order the issue lists them.
        expect(faqPage.mainEntity.map((entry) => entry.name)).toEqual([
            t("compareCatawikiPage.faq.items.alternative.question"),
            t("compareCatawikiPage.faq.items.replace.question"),
            t("compareCatawikiPage.faq.items.bid.question"),
            t("compareCatawikiPage.faq.items.dealerStock.question"),
            t("compareCatawikiPage.faq.items.languages.question"),
        ]);
        expect(JSON.stringify([article, faqPage])).not.toMatch(
            /"@type":"(Review|AggregateRating|Rating)"/,
        );
    });

    it("builds the eBay page from its visible strings, with no review markup", () => {
        const [article, faqPage] = build(EBAY_COMPARISON);

        expect(article).toMatchObject({
            "@type": "Article",
            headline: stripInlineMarkup(t("compareEbayPage.hero.title")),
            description: t("compareEbayPage.hero.subtitle"),
            dateModified: EBAY_COMPARISON_LAST_REVIEWED,
            url: "https://aura-historia.com/de/compare/ebay",
        });
        expect(article.dateModified).toBe("2026-11-09");
        expect(article.about).toEqual(
            EBAY_COMPARISON.structuredDataTopics.map((topic) =>
                t(`compareEbayPage.structuredData.about.${topic}`),
            ),
        );
        expect(faqPage.mainEntity.map((entry) => entry.name)).toEqual(
            getComparisonFaq(EBAY_COMPARISON).map((item) => t(item.questionKey)),
        );
        expect(faqPage.mainEntity).toHaveLength(5);
        // The questions people ask, in the order the issue lists them.
        expect(faqPage.mainEntity.map((entry) => entry.name)).toEqual([
            t("compareEbayPage.faq.items.alternative.question"),
            t("compareEbayPage.faq.items.replace.question"),
            t("compareEbayPage.faq.items.rareArt.question"),
            t("compareEbayPage.faq.items.everydayCollectibles.question"),
            t("compareEbayPage.faq.items.authenticity.question"),
        ]);
        expect(JSON.stringify([article, faqPage])).not.toMatch(
            /"@type":"(Review|AggregateRating|Rating)"/,
        );
    });

    it("builds the art price databases page from its visible strings, with no review markup", () => {
        const [article, faqPage] = build(ART_PRICE_DATABASES_COMPARISON);

        expect(article).toMatchObject({
            "@type": "Article",
            headline: stripInlineMarkup(t("compareArtPriceDatabasesPage.hero.title")),
            description: t("compareArtPriceDatabasesPage.hero.subtitle"),
            dateModified: ART_PRICE_DATABASES_COMPARISON_LAST_REVIEWED,
            url: "https://aura-historia.com/de/compare/art-price-databases",
        });
        expect(article.dateModified).toBe("2026-11-09");
        expect(article.about).toEqual(
            ART_PRICE_DATABASES_COMPARISON.structuredDataTopics.map((topic) =>
                t(`compareArtPriceDatabasesPage.structuredData.about.${topic}`),
            ),
        );
        expect(faqPage.mainEntity.map((entry) => entry.name)).toEqual(
            getComparisonFaq(ART_PRICE_DATABASES_COMPARISON).map((item) => t(item.questionKey)),
        );
        expect(faqPage.mainEntity).toHaveLength(6);
        // The questions people ask, in the order the issue lists them.
        expect(faqPage.mainEntity.map((entry) => entry.name)).toEqual([
            t("compareArtPriceDatabasesPage.faq.items.alternativeArtnet.question"),
            t("compareArtPriceDatabasesPage.faq.items.alternativeWorthPoint.question"),
            t("compareArtPriceDatabasesPage.faq.items.alternativeArtpriceMutualArt.question"),
            t("compareArtPriceDatabasesPage.faq.items.worth.question"),
            t("compareArtPriceDatabasesPage.faq.items.similarOffers.question"),
            t("compareArtPriceDatabasesPage.faq.items.pastResults.question"),
        ]);
        expect(JSON.stringify([article, faqPage])).not.toMatch(
            /"@type":"(Review|AggregateRating|Rating)"/,
        );
    });

    it("strips inline emphasis", () => {
        expect(stripInlineMarkup("The short <em>version</em>")).toBe("The short version");
        expect(stripInlineMarkup("<strong>Verdict:</strong> choose")).toBe("Verdict: choose");
    });
});
