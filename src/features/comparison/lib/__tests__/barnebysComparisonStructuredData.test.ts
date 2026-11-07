import { describe, expect, it } from "vitest";

import { BARNEBYS_FAQ_ITEMS } from "@/features/comparison/config/barnebysComparison.data.ts";
import { BARNEBYS_COMPARISON_LAST_REVIEWED } from "@/features/comparison/config/barnebysComparisonReview.ts";
import {
    buildBarnebysComparisonStructuredData,
    stripInlineMarkup,
} from "@/features/comparison/lib/barnebysComparisonStructuredData.ts";
import testI18n from "@/i18n/i18nForTests";

const t = testI18n.t.bind(testI18n);

function build() {
    return buildBarnebysComparisonStructuredData({
        t,
        siteUrl: "https://aura-historia.com",
        pageUrl: "https://aura-historia.com/de/compare/barnebys",
        language: "de",
    });
}

describe("buildBarnebysComparisonStructuredData", () => {
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

        expect(faqPage.mainEntity).toHaveLength(BARNEBYS_FAQ_ITEMS.length);
        expect(faqPage.mainEntity[0]).toEqual({
            "@type": "Question",
            name: t("compareBarnebysPage.faq.items.alternative.question"),
            acceptedAnswer: {
                "@type": "Answer",
                text: t("compareBarnebysPage.faq.items.alternative.answer"),
            },
        });
    });

    it("strips inline emphasis", () => {
        expect(stripInlineMarkup("The short <em>version</em>")).toBe("The short version");
        expect(stripInlineMarkup("<strong>Verdict:</strong> choose")).toBe("Verdict: choose");
    });

    it("keeps the review date an ISO day", () => {
        expect(BARNEBYS_COMPARISON_LAST_REVIEWED).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
});
