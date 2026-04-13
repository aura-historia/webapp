import {
    FacebookIcon,
    InstagramIcon,
    LinkedInIcon,
    PinterestIcon,
    RedditIcon,
    TikTokIcon,
    XIcon,
    YouTubeIcon,
} from "./SocialIcons.tsx";
import type { ComponentType, SVGProps } from "react";

export interface SocialLink {
    name: string;
    url: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export const POPULAR_CATEGORY_KEYS: string[] = [
    "JEWELRY_PERSONAL_ADORNMENT",
    "FURNITURE",
    "VISUAL_ART",
    "COINS_CURRENCY_MEDALS",
    "CLOCKS_TIMEKEEPING",
    "BOOKS_MANUSCRIPTS_PRINTED_MEDIA",
    "DECORATIVE_OBJECTS",
    "WEAPONS",
];

export const POPULAR_PERIOD_KEYS: string[] = [
    "BAROQUE",
    "ART_NOUVEAU",
    "ART_DECO",
    "ANTIQUITY",
    "RENAISSANCE",
    "HISTORICISM",
    "BIEDERMEIER",
    "MID_CENTURY_MODERN",
];

export const POPULAR_COMBINATION_SLUGS: string[] = [
    "biedermeier-furniture",
    "art-nouveau-jewelry",
    "art-deco-furniture",
    "ancient-weapons",
    "baroque-furniture",
    "renaissance-paintings",
    "ancient-coins",
    "mid-century-furniture",
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
