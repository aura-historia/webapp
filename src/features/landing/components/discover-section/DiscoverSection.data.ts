import watteauGersaintImage from "@/features/landing/assets/watteau-gersaint.webp";

export const DISCOVER_HIGHLIGHTS = [
    {
        titleKey: "discover.highlight1.title",
        descKey: "discover.highlight1.description",
    },
    {
        titleKey: "discover.highlight2.title",
        descKey: "discover.highlight2.description",
    },
    {
        titleKey: "discover.highlight3.title",
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
