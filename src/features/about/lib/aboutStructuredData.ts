import type { TFunction } from "i18next";

import { ABOUT_FAQ_ITEMS } from "@/features/about/config/aboutPage.data";
import { SOCIAL_LINKS } from "@/features/app-shell/components/footer/Footer.data.ts";
import { CONTACT_EMAIL } from "@/features/app-shell/components/navigation/navigationConfig.ts";

type AboutStructuredDataInput = {
    readonly t: TFunction;
    /** The site origin, e.g. `https://aura-historia.com`. */
    readonly siteUrl: string;
    /** The localized canonical URL of the about page. */
    readonly pageUrl: string;
};

/**
 * JSON-LD for the about page: the organization as the page's subject, and the visible questions
 * as an FAQPage. Every value repeats what the page shows; nothing here is only machine-readable.
 */
export function buildAboutStructuredData({ t, siteUrl, pageUrl }: AboutStructuredDataInput) {
    const aboutPage = {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        name: t("meta.about.title"),
        description: t("meta.about.description"),
        url: pageUrl,
        mainEntity: {
            "@type": "Organization",
            name: "Aura Historia",
            url: siteUrl,
            logo: `${siteUrl}/icon1080x1080.png`,
            email: CONTACT_EMAIL,
            foundingDate: "2026",
            address: {
                "@type": "PostalAddress",
                addressLocality: "Leipzig",
                addressCountry: "DE",
            },
            sameAs: SOCIAL_LINKS.map((link) => link.url),
        },
    };
    const faqPage = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: ABOUT_FAQ_ITEMS.map((item) => ({
            "@type": "Question",
            name: t(item.questionKey),
            acceptedAnswer: {
                "@type": "Answer",
                text: t(item.answerKey),
            },
        })),
    };

    return [aboutPage, faqPage] as const;
}
