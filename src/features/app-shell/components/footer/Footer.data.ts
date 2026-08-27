import {
    FacebookIcon,
    InstagramIcon,
    LinkedInIcon,
    PinterestIcon,
    RedditIcon,
    TikTokIcon,
    XIcon,
    YouTubeIcon,
} from "@/components/icons/SocialIcons.tsx";
import type { ComponentType, SVGProps } from "react";
import { LANDING_PAGE_FRAGMENTS } from "@/components/landing-page/LandingPage.fragments.ts";
import {
    SHOPIFY_APP_STORE_URL,
    WORDPRESS_PLUGIN_DIRECTORY_URL,
} from "@/features/partner/partner-program/config/partnerProgramLinks.ts";

export interface SocialLink {
    name: string;
    url: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export interface LandingPageFooterLink {
    translationKey: string;
    fragment: string;
}

export interface PartnerProgramFooterLink {
    translationKey: string;
    href: string;
    external?: boolean;
}

export interface CompareFooterLink {
    translationKey: string;
    href: string;
}

export const COMPARE_FOOTER_LINKS: CompareFooterLink[] = [
    {
        translationKey: "footer.compareLinks.barnebys",
        href: "/$lng/compare/barnebys",
    },
];

export const PARTNER_PROGRAM_FOOTER_LINKS: PartnerProgramFooterLink[] = [
    {
        translationKey: "footer.partnerProgramLinks.overview",
        href: "/$lng/partner-program",
    },
    {
        translationKey: "footer.partnerProgramLinks.dashboard",
        href: "/$lng/partners/applications",
    },
    {
        translationKey: "footer.partnerProgramLinks.woocommerce",
        href: WORDPRESS_PLUGIN_DIRECTORY_URL,
        external: true,
    },
    {
        translationKey: "footer.partnerProgramLinks.shopify",
        href: SHOPIFY_APP_STORE_URL,
        external: true,
    },
    {
        translationKey: "footer.partnerProgramLinks.customApi",
        href: "/$lng/partner-program/custom-integration",
    },
    {
        translationKey: "footer.partnerProgramLinks.apply",
        href: "/$lng/partners/applications",
    },
];

export const LANDING_PAGE_FOOTER_LINKS: LandingPageFooterLink[] = [
    {
        translationKey: "footer.landingPageLinks.recentlyAdded",
        fragment: LANDING_PAGE_FRAGMENTS.recentlyAdded,
    },
    {
        translationKey: "footer.landingPageLinks.discover",
        fragment: LANDING_PAGE_FRAGMENTS.discover,
    },
    {
        translationKey: "footer.landingPageLinks.features",
        fragment: LANDING_PAGE_FRAGMENTS.features,
    },
    {
        translationKey: "footer.landingPageLinks.howItWorks",
        fragment: LANDING_PAGE_FRAGMENTS.howItWorks,
    },
    {
        translationKey: "footer.landingPageLinks.pricing",
        fragment: LANDING_PAGE_FRAGMENTS.pricing,
    },
    {
        translationKey: "footer.landingPageLinks.newsletter",
        fragment: LANDING_PAGE_FRAGMENTS.newsletter,
    },
    {
        translationKey: "footer.landingPageLinks.faq",
        fragment: LANDING_PAGE_FRAGMENTS.faq,
    },
];

export const SOCIAL_LINKS: SocialLink[] = [
    {
        name: "X",
        url: "https://x.com/aurahistoria",
        icon: XIcon,
    },
    {
        name: "Instagram",
        url: "https://www.instagram.com/aura_historia/",
        icon: InstagramIcon,
    },
    {
        name: "LinkedIn",
        url: "https://linkedin.com/company/aura-historia",
        icon: LinkedInIcon,
    },
    {
        name: "Facebook",
        url: "https://www.facebook.com/people/Aura-Historia/61588345829308/",
        icon: FacebookIcon,
    },
    {
        name: "Pinterest",
        url: "https://de.pinterest.com/0emdo9gqshbeqm1r18hqq0sm53s5gx/",
        icon: PinterestIcon,
    },
    {
        name: "Reddit",
        url: "https://www.reddit.com/user/aura-historia/",
        icon: RedditIcon,
    },
    {
        name: "YouTube",
        url: "https://www.youtube.com/@aurahistoria",
        icon: YouTubeIcon,
    },
    {
        name: "TikTok",
        url: "https://www.tiktok.com/@aurahistoria",
        icon: TikTokIcon,
    },
];
