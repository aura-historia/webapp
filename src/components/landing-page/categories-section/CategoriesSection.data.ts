import {
    Armchair,
    BookOpen,
    Clock,
    Crown,
    Gem,
    Lamp,
    type LucideIcon,
    MapPin,
    Palette,
    Scroll,
    Sparkles,
} from "lucide-react";

export interface CategoryCard {
    readonly titleKey: string;
    readonly icon: LucideIcon;
}

export const CATEGORY_CARDS: CategoryCard[] = [
    {
        titleKey: "landingPage.categories.furniture",
        icon: Armchair,
    },
    {
        titleKey: "landingPage.categories.paintings",
        icon: Palette,
    },
    {
        titleKey: "landingPage.categories.porcelain",
        icon: Sparkles,
    },
    {
        titleKey: "landingPage.categories.silver",
        icon: Crown,
    },
    {
        titleKey: "landingPage.categories.jewelry",
        icon: Gem,
    },
    {
        titleKey: "landingPage.categories.books",
        icon: BookOpen,
    },
    {
        titleKey: "landingPage.categories.clocks",
        icon: Clock,
    },
    {
        titleKey: "landingPage.categories.maps",
        icon: MapPin,
    },
    {
        titleKey: "landingPage.categories.sculptures",
        icon: Scroll,
    },
    {
        titleKey: "landingPage.categories.lighting",
        icon: Lamp,
    },
];
