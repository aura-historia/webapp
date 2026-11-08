import { SOCIAL_LINKS } from "@/features/app-shell/components/footer/Footer.data.ts";
import { CONTACT_EMAIL } from "@/features/app-shell/components/navigation/navigationConfig.ts";

/** The brand as search engines should name the site; not translated. */
export const SITE_NAME = "Aura Historia";

function siteOrigin(siteUrl: string): string {
    return siteUrl.replace(/\/$/, "");
}

/** Stable node ids, so pages can refer to the organization and website instead of repeating them. */
export function organizationId(siteUrl: string): string {
    return `${siteOrigin(siteUrl)}/#organization`;
}

export function webSiteId(siteUrl: string): string {
    return `${siteOrigin(siteUrl)}/#website`;
}

/**
 * The organization behind the site, with the facts the about page and footer show. Nothing here
 * is only machine-readable.
 */
export function buildOrganizationNode(siteUrl: string) {
    const origin = siteOrigin(siteUrl);
    return {
        "@type": "Organization",
        "@id": organizationId(origin),
        name: SITE_NAME,
        url: origin,
        logo: `${origin}/icon1080x1080.png`,
        email: CONTACT_EMAIL,
        foundingDate: "2026",
        address: {
            "@type": "PostalAddress",
            addressLocality: "Leipzig",
            addressCountry: "DE",
        },
        sameAs: SOCIAL_LINKS.map((link) => link.url),
    };
}

/**
 * The website, which Google reads on the home page to name the site in results. `url` is the
 * domain root, which redirects each visitor to their language.
 */
export function buildWebSiteNode(siteUrl: string, language: string) {
    const origin = siteOrigin(siteUrl);
    return {
        "@type": "WebSite",
        "@id": webSiteId(origin),
        name: SITE_NAME,
        url: `${origin}/`,
        inLanguage: language,
        publisher: { "@id": organizationId(origin) },
    };
}
