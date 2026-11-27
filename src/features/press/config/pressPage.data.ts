/** Anchors of the press page's chapters, linked from the hero's "On this page" row. */
export const PRESS_SECTION_IDS = {
    facts: "facts",
    descriptions: "descriptions",
    logo: "logo",
    colour: "colour",
    typography: "typography",
    images: "images",
    usage: "usage",
    contact: "contact",
} as const;

export type PressSectionId = (typeof PRESS_SECTION_IDS)[keyof typeof PRESS_SECTION_IDS];

/**
 * Logo files, the brand kit and its text files live in `public/press/`, generated from the site's
 * wordmark by `scripts/generate-press-kit.mjs`. Paths are not translated.
 */
export const PRESS_KIT_PATH = "/press";
export const BRAND_KIT_URL = `${PRESS_KIT_PATH}/aura-historia-brand-kit.zip`;

export type PressLogoGround = "parchment" | "ink" | "oxblood";

export type PressLogo = {
    /** Translation key below `pressPage.logo.cards` and the card's React key. */
    readonly id: string;
    /** File name in `public/press/` without extension; each logo has an `.svg` and a `.png`. */
    readonly file: string;
    /** The ground the card previews the logo on; the oxblood files carry their own ground. */
    readonly ground: PressLogoGround;
    readonly layout: "inline" | "stacked";
};

export const PRESS_LOGOS: readonly PressLogo[] = [
    { id: "inlineInk", file: "aura-historia-wordmark-ink", ground: "parchment", layout: "inline" },
    {
        id: "inlineParchment",
        file: "aura-historia-wordmark-parchment",
        ground: "ink",
        layout: "inline",
    },
    {
        id: "inlineOxblood",
        file: "aura-historia-wordmark-oxblood",
        ground: "oxblood",
        layout: "inline",
    },
    {
        id: "stackedInk",
        file: "aura-historia-wordmark-stacked-ink",
        ground: "parchment",
        layout: "stacked",
    },
    {
        id: "stackedParchment",
        file: "aura-historia-wordmark-stacked-parchment",
        ground: "ink",
        layout: "stacked",
    },
    {
        id: "stackedOxblood",
        file: "aura-historia-wordmark-stacked-oxblood",
        ground: "oxblood",
        layout: "stacked",
    },
];

export const LOGO_FORMATS = ["svg", "png"] as const;

export function pressLogoUrl(logo: PressLogo, format: (typeof LOGO_FORMATS)[number]): string {
    return `${PRESS_KIT_PATH}/${logo.file}.${format}`;
}

/** What not to do with the wordmark, each drawn as a wrong example. */
export const LOGO_MISUSES = ["stretched", "recoloured", "effects", "loupe"] as const;

export type LogoMisuse = (typeof LOGO_MISUSES)[number];

export type BrandColour = {
    readonly id: string;
    /** The published value; it matches the design-system token named in the comment. */
    readonly hex: string;
    readonly rgb: string;
};

/** The brand palette as published to the press; also written to `aura-historia-colours.txt`. */
export const BRAND_COLOURS: readonly BrandColour[] = [
    { id: "parchment", hex: "#F4EEE3", rgb: "244 238 227" }, // --surface
    { id: "ink", hex: "#170D0E", rgb: "23 13 14" }, // --ink
    { id: "oxblood", hex: "#4A1520", rgb: "74 21 32" }, // --oxblood
    { id: "brass", hex: "#B8935A", rgb: "184 147 90" }, // --brass
    { id: "brassLight", hex: "#E2C9A0", rgb: "226 201 160" }, // --brass-light
    { id: "sand", hex: "#D9CDB8", rgb: "217 205 184" }, // --sand
];

export type BrandTypeface = {
    readonly id: "newsreader" | "geist" | "geistMono";
    readonly name: string;
    readonly specimenUrl: string;
};

export const BRAND_TYPEFACES: readonly BrandTypeface[] = [
    {
        id: "newsreader",
        name: "Newsreader",
        specimenUrl: "https://fonts.google.com/specimen/Newsreader",
    },
    { id: "geist", name: "Geist", specimenUrl: "https://fonts.google.com/specimen/Geist" },
    {
        id: "geistMono",
        name: "Geist Mono",
        specimenUrl: "https://fonts.google.com/specimen/Geist+Mono",
    },
];

/** Fact sheet rows, in order; each has a label and a value below `pressPage.facts.items`. */
export const PRESS_FACTS = [
    "name",
    "whatItIs",
    "founded",
    "team",
    "languages",
    "markets",
    "aiAssistants",
    "website",
    "basedIn",
] as const;

export const PRESS_USAGE = {
    allowed: ["coverage", "scale", "shorten", "link"],
    notAllowed: ["change", "endorsement", "advertising", "attribution"],
} as const;
