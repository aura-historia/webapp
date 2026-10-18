import { LANDING_PAGE_FRAGMENTS } from "@/features/landing/config/landingPageFragments.ts";
import {
    SHOPIFY_APP_STORE_URL,
    WORDPRESS_PLUGIN_DIRECTORY_URL,
} from "@/features/partner/partner-program/config/partnerProgramLinks.ts";

export type FooterRoute =
    | "/$lng/partner-program"
    | "/$lng/partners/applications"
    | "/$lng/partner-program/custom-integration"
    | "/$lng/about-us"
    | "/$lng/imprint"
    | "/$lng/privacy"
    | "/$lng/terms-and-conditions"
    | "/$lng/consent-settings"
    | "/$lng/compare/barnebys";

export type FooterLink =
    | { readonly kind: "landing"; readonly translationKey: string; readonly fragment: string }
    | { readonly kind: "route"; readonly translationKey: string; readonly to: FooterRoute }
    | { readonly kind: "external"; readonly translationKey: string; readonly href: string };

export interface FooterGroup {
    readonly id: "discover" | "partners" | "company";
    readonly titleKey: string;
    readonly links: readonly FooterLink[];
}

export interface SocialLink {
    readonly name: string;
    readonly url: string;
}

export const FOOTER_GROUPS: readonly FooterGroup[] = [
    {
        id: "discover",
        titleKey: "footer.sections.discover",
        links: [
            {
                kind: "landing",
                translationKey: "footer.landingPageLinks.recentlyAdded",
                fragment: LANDING_PAGE_FRAGMENTS.recentlyAdded,
            },
            {
                kind: "landing",
                translationKey: "footer.landingPageLinks.discover",
                fragment: LANDING_PAGE_FRAGMENTS.discover,
            },
            {
                kind: "landing",
                translationKey: "footer.landingPageLinks.features",
                fragment: LANDING_PAGE_FRAGMENTS.features,
            },
            {
                kind: "landing",
                translationKey: "footer.landingPageLinks.howItWorks",
                fragment: LANDING_PAGE_FRAGMENTS.howItWorks,
            },
            {
                kind: "landing",
                translationKey: "footer.landingPageLinks.pricing",
                fragment: LANDING_PAGE_FRAGMENTS.pricing,
            },
            {
                kind: "landing",
                translationKey: "footer.landingPageLinks.newsletter",
                fragment: LANDING_PAGE_FRAGMENTS.newsletter,
            },
            {
                kind: "landing",
                translationKey: "footer.landingPageLinks.faq",
                fragment: LANDING_PAGE_FRAGMENTS.faq,
            },
        ],
    },
    {
        id: "partners",
        titleKey: "footer.sections.partners",
        links: [
            {
                kind: "route",
                translationKey: "footer.partnerProgramLinks.overview",
                to: "/$lng/partner-program",
            },
            {
                kind: "route",
                translationKey: "footer.partnerProgramLinks.dashboard",
                to: "/$lng/partners/applications",
            },
            {
                kind: "external",
                translationKey: "footer.partnerProgramLinks.woocommerce",
                href: WORDPRESS_PLUGIN_DIRECTORY_URL,
            },
            {
                kind: "external",
                translationKey: "footer.partnerProgramLinks.shopify",
                href: SHOPIFY_APP_STORE_URL,
            },
            {
                kind: "route",
                translationKey: "footer.partnerProgramLinks.customApi",
                to: "/$lng/partner-program/custom-integration",
            },
            {
                kind: "route",
                translationKey: "footer.partnerProgramLinks.apply",
                to: "/$lng/partners/applications",
            },
        ],
    },
    {
        id: "company",
        titleKey: "footer.sections.company",
        links: [
            { kind: "route", translationKey: "footer.about", to: "/$lng/about-us" },
            { kind: "route", translationKey: "footer.imprint", to: "/$lng/imprint" },
            { kind: "route", translationKey: "footer.privacy", to: "/$lng/privacy" },
            { kind: "route", translationKey: "footer.terms", to: "/$lng/terms-and-conditions" },
            {
                kind: "route",
                translationKey: "footer.cookieSettings",
                to: "/$lng/consent-settings",
            },
            {
                kind: "route",
                translationKey: "footer.compareBarnebys",
                to: "/$lng/compare/barnebys",
            },
        ],
    },
];

export const SOCIAL_LINKS: readonly SocialLink[] = [
    { name: "Instagram", url: "https://www.instagram.com/aura_historia/" },
    { name: "LinkedIn", url: "https://linkedin.com/company/aura-historia" },
    { name: "X", url: "https://x.com/aurahistoria" },
    { name: "Facebook", url: "https://www.facebook.com/people/Aura-Historia/61588345829308/" },
    { name: "Pinterest", url: "https://de.pinterest.com/0emdo9gqshbeqm1r18hqq0sm53s5gx/" },
    { name: "Reddit", url: "https://www.reddit.com/user/aura-historia/" },
    { name: "YouTube", url: "https://www.youtube.com/@aurahistoria" },
    { name: "TikTok", url: "https://www.tiktok.com/@aurahistoria" },
];
