import { describe, expect, it } from "vitest";

import { ABOUT_FAQ_ITEMS } from "@/features/about/config/aboutPage.data";
import { buildAboutStructuredData } from "@/features/about/lib/aboutStructuredData.ts";
import { SOCIAL_LINKS } from "@/features/app-shell/components/footer/Footer.data.ts";
import testI18n from "@/i18n/i18nForTests";

function build() {
    return buildAboutStructuredData({
        t: testI18n.t.bind(testI18n),
        siteUrl: "https://aura-historia.com",
        pageUrl: "https://aura-historia.com/de/about-us",
    });
}

describe("buildAboutStructuredData", () => {
    it("describes the organization with the facts the page shows", () => {
        const [aboutPage] = build();

        expect(aboutPage).toMatchObject({
            "@type": "AboutPage",
            name: "Über uns | Aura Historia",
            url: "https://aura-historia.com/de/about-us",
            mainEntity: {
                "@type": "Organization",
                name: "Aura Historia",
                url: "https://aura-historia.com",
                logo: "https://aura-historia.com/icon1080x1080.png",
                email: "contact@aura-historia.com",
                foundingDate: "2026",
                address: { addressLocality: "Leipzig", addressCountry: "DE" },
                sameAs: SOCIAL_LINKS.map((link) => link.url),
            },
        });
        expect(aboutPage.mainEntity).not.toHaveProperty("founder");
        expect(aboutPage.mainEntity).not.toHaveProperty("legalName");
    });

    it("publishes every visible question with its answer", () => {
        const [, faqPage] = build();

        expect(faqPage["@type"]).toBe("FAQPage");
        expect(faqPage.mainEntity).toHaveLength(ABOUT_FAQ_ITEMS.length);
        expect(faqPage.mainEntity[0]).toEqual({
            "@type": "Question",
            name: "Was ist Aura Historia?",
            acceptedAnswer: {
                "@type": "Answer",
                text: testI18n.t("aboutPage.faq.items.whatIs.answer"),
            },
        });
    });
});
