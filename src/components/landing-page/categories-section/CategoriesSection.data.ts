import { Armchair, BookOpen, Clock, Gem, Frame, Lamp, Coins, Scroll } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface CategoryCard {
    readonly titleKey: string;
    readonly icon: LucideIcon;
    readonly gradient: string;
}

export const CATEGORY_CARDS: CategoryCard[] = [
    {
        titleKey: "landingPage.categories.furniture",
        icon: Armchair,
        gradient: "from-amber-900/80 to-amber-800/60",
    },
    {
        titleKey: "landingPage.categories.jewelry",
        icon: Gem,
        gradient: "from-yellow-900/80 to-yellow-800/60",
    },
    {
        titleKey: "landingPage.categories.paintings",
        icon: Frame,
        gradient: "from-stone-900/80 to-stone-800/60",
    },
    {
        titleKey: "landingPage.categories.clocks",
        icon: Clock,
        gradient: "from-zinc-900/80 to-zinc-800/60",
    },
    {
        titleKey: "landingPage.categories.books",
        icon: BookOpen,
        gradient: "from-red-900/80 to-red-800/60",
    },
    {
        titleKey: "landingPage.categories.lighting",
        icon: Lamp,
        gradient: "from-orange-900/80 to-orange-800/60",
    },
    {
        titleKey: "landingPage.categories.coins",
        icon: Coins,
        gradient: "from-emerald-900/80 to-emerald-800/60",
    },
    {
        titleKey: "landingPage.categories.manuscripts",
        icon: Scroll,
        gradient: "from-slate-900/80 to-slate-800/60",
    },
];
