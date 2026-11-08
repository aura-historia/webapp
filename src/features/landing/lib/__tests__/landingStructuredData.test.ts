import { describe, expect, it } from "vitest";

import { SOCIAL_LINKS } from "@/features/app-shell/components/footer/Footer.data.ts";
import { FAQ_DATA } from "@/features/landing/components/faq-section/FAQSection.data.ts";
import { buildLandingStructuredData } from "@/features/landing/lib/landingStructuredData.ts";
import testI18n from "@/i18n/i18nForTests";

function build() {
    return buildLandingStructuredData({
        t: testI18n.t.bind(testI18n),
        siteUrl: "https://aura-historia.com",
        pageUrl: "https://aura-historia.com/de",
        language: "de",
    });
}

describe("buildLandingStructuredData", () => {
    it("names the site and its organization, linked by id", () => {
        const [graph] = build();
        const [organization, webSite, webPage] = graph["@graph"];

        expect(organization).toMatchObject({
            "@type": "Organization",
            "@id": "https://aura-historia.com/#organization",
            name: "Aura Historia",
            url: "https://aura-historia.com",
            logo: "https://aura-historia.com/icon1080x1080.png",
            sameAs: SOCIAL_LINKS.map((link) => link.url),
        });
        expect(webSite).toEqual({
            "@type": "WebSite",
            "@id": "https://aura-historia.com/#website",
            name: "Aura Historia",
            url: "https://aura-historia.com/",
            inLanguage: "de",
            publisher: { "@id": "https://aura-historia.com/#organization" },
        });
        expect(webPage).toMatchObject({
            "@type": "WebPage",
            url: "https://aura-historia.com/de",
            name: testI18n.t("meta.home.title"),
            isPartOf: { "@id": "https://aura-historia.com/#website" },
        });
    });

    it("publishes every visible question with its answer", () => {
        const [, faqPage] = build();

        expect(faqPage.mainEntity).toHaveLength(FAQ_DATA.length);
        expect(faqPage.mainEntity[0]).toEqual({
            "@type": "Question",
            name: testI18n.t(FAQ_DATA[0].questionKey),
            acceptedAnswer: { "@type": "Answer", text: testI18n.t(FAQ_DATA[0].answerKey) },
        });
    });
});
