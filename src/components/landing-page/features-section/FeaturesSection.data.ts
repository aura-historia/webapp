import { Bot, Funnel, Globe, Heart, History, Languages, Search } from "lucide-react";

export const FEATURES_CARD_DATA = [
    {
        icon: Search,
        titleKey: "landingPage.features.search.title",
        descKey: "landingPage.features.search.description",
    },
    {
        icon: Globe,
        titleKey: "landingPage.features.global.title",
        descKey: "landingPage.features.global.description",
    },
    {
        icon: Languages,
        titleKey: "landingPage.features.translations.title",
        descKey: "landingPage.features.translations.description",
    },
    {
        icon: History,
        titleKey: "landingPage.features.history.title",
        descKey: "landingPage.features.history.description",
    },
    {
        icon: Heart,
        titleKey: "landingPage.features.watchlist.title",
        descKey: "landingPage.features.watchlist.description",
    },
    {
        icon: Funnel,
        titleKey: "landingPage.features.personalFilter.title",
        descKey: "landingPage.features.personalFilter.description",
        isPreview: true,
    },
    {
        icon: Bot,
        titleKey: "landingPage.features.aiSearchAgent.title",
        descKey: "landingPage.features.aiSearchAgent.description",
        isPreview: true,
    },
];
