import watchlistDemo from "@/features/landing/assets/demos/watchlist-demo.mp4";
import historyDemo from "@/features/landing/assets/demos/history-demo.mp4";
import filterDemo from "@/features/landing/assets/demos/filter-demo.mp4";
import aiFilterDemo from "@/features/landing/assets/demos/ai-filter-demo.mp4";

const ART_BASEL_UBS_REPORT_URL =
    "https://www.ubs.com/global/en/our-firm/art/art-market-research.html";
const IBISWORLD_US_ANTIQUE_STORES_URL =
    "https://www.ibisworld.com/united-states/industry/antique-stores/6467/";
const IBISWORLD_EU_SECOND_HAND_URL =
    "https://www.ibisworld.com/europe/industry/second-hand-goods-retailing/200596/";

export const FEATURES_CARD_DATA = [
    {
        titleKey: "landingPage.features.marketScale.title",
        descKey: "landingPage.features.marketScale.description",
        visual: {
            kind: "metric",
            valueKey: "landingPage.features.marketScale.visual.value",
            labelKey: "landingPage.features.marketScale.visual.label",
            sources: [
                {
                    label: "Art Basel / UBS",
                    href: ART_BASEL_UBS_REPORT_URL,
                },
            ],
        },
    },
    {
        titleKey: "landingPage.features.beyondAuction.title",
        descKey: "landingPage.features.beyondAuction.description",
        visual: {
            kind: "metric",
            valueKey: "landingPage.features.beyondAuction.visual.value",
            labelKey: "landingPage.features.beyondAuction.visual.label",
            sources: [
                {
                    label: "Art Basel / UBS",
                    href: ART_BASEL_UBS_REPORT_URL,
                },
            ],
        },
    },
    {
        titleKey: "landingPage.features.translations.title",
        descKey: "landingPage.features.translations.description",
        visual: {
            kind: "metric",
            valueKey: "landingPage.features.translations.visual.value",
            labelKey: "landingPage.features.translations.visual.label",
            sources: [
                {
                    label: "IBISWorld US",
                    href: IBISWORLD_US_ANTIQUE_STORES_URL,
                },
                {
                    label: "IBISWorld Europe",
                    href: IBISWORLD_EU_SECOND_HAND_URL,
                },
            ],
        },
    },
    {
        titleKey: "landingPage.features.watchlist.title",
        descKey: "landingPage.features.watchlist.description",
        visual: {
            kind: "video",
            src: watchlistDemo,
        },
    },
    {
        titleKey: "landingPage.features.personalFilter.title",
        descKey: "landingPage.features.personalFilter.description",
        visual: {
            kind: "video",
            src: filterDemo,
        },
    },
    {
        titleKey: "landingPage.features.history.title",
        descKey: "landingPage.features.history.description",
        visual: {
            kind: "video",
            src: historyDemo,
        },
    },
    {
        titleKey: "landingPage.features.aiSearchAgent.title",
        descKey: "landingPage.features.aiSearchAgent.description",
        visual: {
            kind: "video",
            src: aiFilterDemo,
        },
    },
] as const;
