import { BarnebysComparisonPage } from "@/features/comparison/components/BarnebysComparisonPage";
import i18n from "@/i18n/i18nForTests";
import { Route } from "../compare.barnebys";

vi.mock("@/env", () => ({
    env: {
        VITE_APP_URL: "https://aura.test",
        VITE_CLIENT_ID: "test-client-id",
        VITE_FEATURE_LOGIN_ENABLED: true,
        VITE_FEATURE_SEARCH_ENABLED: true,
        VITE_USER_POOL_ID: "test-pool-id",
    },
}));

const canonicalUrl = "https://aura.test/compare/barnebys";

type JsonLdScript = {
    type: string;
    children: string;
};

type HeadResult = {
    meta: Array<Record<string, string>>;
    links?: Array<Record<string, string>>;
    scripts?: JsonLdScript[];
};

function getRouteHead(): HeadResult {
    const head = Route.options.head;

    if (!head) {
        throw new Error("Expected Barnebys comparison route to define head metadata");
    }

    return head({} as never) as HeadResult;
}

describe("compare Barnebys route", () => {
    it("uses the comparison page component", () => {
        expect(Route.options.component).toBe(BarnebysComparisonPage);
    });

    it("generates localized metadata and structured data", () => {
        const head = getRouteHead();

        expect(head.meta).toContainEqual({
            title: i18n.t("meta.compareBarnebys.title"),
        });
        expect(head.meta).toContainEqual({
            name: "description",
            content: i18n.t("meta.compareBarnebys.description"),
        });
        expect(head.links).toContainEqual({
            rel: "canonical",
            href: canonicalUrl,
        });

        const [webPageScript, faqScript] = head.scripts ?? [];
        const webPageJsonLd = JSON.parse(webPageScript.children) as {
            "@type": string;
            name: string;
            description: string;
            url: string;
            about: string[];
        };
        const faqJsonLd = JSON.parse(faqScript.children) as {
            "@type": string;
            mainEntity: Array<{
                name: string;
                acceptedAnswer: { text: string };
            }>;
        };

        expect(webPageScript.type).toBe("application/ld+json");
        expect(webPageJsonLd).toMatchObject({
            "@type": "WebPage",
            name: i18n.t("meta.compareBarnebys.title"),
            description: i18n.t("meta.compareBarnebys.description"),
            url: canonicalUrl,
        });
        expect(webPageJsonLd.about).toContain(
            i18n.t("compareBarnebysPage.structuredData.about.aiDiscovery"),
        );

        expect(faqScript.type).toBe("application/ld+json");
        expect(faqJsonLd["@type"]).toBe("FAQPage");
        expect(faqJsonLd.mainEntity).toHaveLength(5);
        expect(faqJsonLd.mainEntity[0]).toMatchObject({
            name: i18n.t("compareBarnebysPage.faq.items.alternative.question"),
            acceptedAnswer: {
                text: i18n.t("compareBarnebysPage.faq.items.alternative.answer"),
            },
        });
    });
});
