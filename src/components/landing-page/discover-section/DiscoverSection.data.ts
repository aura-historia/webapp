import watteauGersaintImage from "@/assets/landing-page/watteau-gersaint.webp";

export const DISCOVER_HIGHLIGHTS = [
    {
        titleKey: "discover.highlight1.title",
        titleFallbackKey: "discover.highlight1.titleFallback",
        descKey: "discover.highlight1.description",
    },
    {
        titleKey: "discover.highlight2.title",
        titleFallbackKey: undefined,
        descKey: "discover.highlight2.description",
    },
    {
        titleKey: "discover.highlight3.title",
        titleFallbackKey: undefined,
        descKey: "discover.highlight3.description",
    },
] as const;

export const DISCOVER_ARTWORKS = {
    watteau: {
        image: watteauGersaintImage,
        altKey: "discover.artworks.watteau.alt",
        captionKey: "discover.artworks.watteau.caption",
    },
} as const;
