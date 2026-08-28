import holbeinAmbassadorsImage from "@/features/landing/assets/holbein-ambassadors.webp";
import pastonTreasureImage from "@/features/landing/assets/paston-treasure.webp";

export const ARTWORK_STORY_SECTIONS = [
    {
        eyebrowKey: "landingPage.artworkStories.connoisseurship.eyebrow",
        titleKey: "landingPage.artworkStories.connoisseurship.title",
        descriptionKey: "landingPage.artworkStories.connoisseurship.description",
        supportingKey: "landingPage.artworkStories.connoisseurship.supporting",
        imageAltKey: "landingPage.artworkStories.connoisseurship.imageAlt",
        captionKey: "landingPage.artworkStories.connoisseurship.caption",
        image: holbeinAmbassadorsImage,
        imagePosition: "left",
    },
    {
        eyebrowKey: "landingPage.artworkStories.globalCollecting.eyebrow",
        titleKey: "landingPage.artworkStories.globalCollecting.title",
        descriptionKey: "landingPage.artworkStories.globalCollecting.description",
        supportingKey: "landingPage.artworkStories.globalCollecting.supporting",
        imageAltKey: "landingPage.artworkStories.globalCollecting.imageAlt",
        captionKey: "landingPage.artworkStories.globalCollecting.caption",
        image: pastonTreasureImage,
        imagePosition: "right",
    },
] as const;
