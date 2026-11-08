import { Armchair, Bell, Eye, Globe, Languages, Layers, Network, Store } from "lucide-react";

import type { ComparisonDefinition } from "@/features/comparison/config/comparisonDefinition.ts";
import { ARTSY_COMPARISON_LAST_REVIEWED } from "@/features/comparison/config/artsyComparisonReview.ts";

/*
 * Sources for the claims about Artsy (all accessed 2026-11-08). Never render these as links:
 * calls to action stay internal and the page never links to a competitor.
 *
 * - Scope and figures: Artsy's pages disagree with each other (homepage "4000+ galleries", About
 *   page "3K" and "3,100+", llms.txt "3,000+"; artists "94K" on the About page, "90,000+" in the
 *   App Store, "100,000+" in llms.txt), so where they disagree the copy uses only what every page
 *   supports: "more than 1 million artworks" and "thousands of galleries and auction houses",
 *   dated November 2026. Artist counts are left out. "More than 3.4 million collectors and
 *   enthusiasts" appears on the About page only and no other page contradicts it, so it is
 *   attributed to Artsy's own website and dated.
 *   https://www.artsy.net/ (title and description: "over 1 million artworks … from 4000+ galleries
 *   and top auction houses")
 *   https://www.artsy.net/about ("1M+ Artworks Available", "3K Partner Galleries and Auction Houses",
 *   "over 3.4 million collectors and enthusiasts use Artsy to browse, learn about, and purchase
 *   works from the most respected names in contemporary and modern art"). The 3.4 million counts
 *   users, not buyers.
 *   https://www.artsy.net/llms.txt ("Browse over 1,000,000 artworks … from 3,000+ galleries and top
 *   auction houses")
 * - Reach: "connect galleries, auction houses, art fairs, and institutions across 100 countries"
 *   (About Artsy, press release). The 190+ countries in the same release count the combined
 *   audience of Artsy and Artnet, so the page does not use them.
 *   https://files.artsy.net/documents/artsy-artnet-press-release.pdf
 * - Artnet: "Artsy and Artnet today announced that they have joined forces, bringing together the
 *   art world's two most important online destinations under shared leadership and vision. The
 *   company will be led by Jeffrey Yin, chief executive officer." (15 April 2026; the wire
 *   release carries a correction from "ownership" to "leadership", so the page never says owned,
 *   bought or merged.) "Both brands will continue to operate as distinct brands and websites."
 *   https://files.artsy.net/documents/artsy-artnet-press-release.pdf
 *   The same release describes Artnet's services ("the Artnet Price Database, Artnet News, Artnet
 *   Auctions, and the Artnet Gallery Network"), which is why the FAQ says the page does not cover
 *   Artnet's price database or other Artnet services. The page names no person: the CEO and the
 *   chairman in the release are left out.
 *   https://www.prnewswire.com/news-releases/artsy-and-artnet-leaders-of-the-art-world-online-join-forces-to-transform-the-future-of-the-industry-302742420.html
 * - Languages: the website declares `<html lang="en">`, has no language switch or hreflang
 *   alternates and no localized paths; the iOS App Store listing shows "Languages: English". The
 *   Android app and the help center could not be verified, so the page states only the website and
 *   the iOS app.
 *   https://www.artsy.net/
 *   https://apps.apple.com/us/app/artsy-buy-sell-fine-art/id703796080
 * - Inventory: the homepage lists the mediums Painting, Photography, Sculpture, Prints, Works on
 *   Paper, Textile Art, Ceramics and Design, and a "Furniture and Design" collection; auctions
 *   "from leading houses and nonprofits", 80+ fairs, viewing rooms and shows (llms.txt). The page
 *   therefore never says Artsy has no design or antiques; it says design is one medium and that
 *   Artsy describes its offer as contemporary and modern art.
 *   https://www.artsy.net/ and https://www.artsy.net/llms.txt
 * - Editorial and artists: "Profiles for over 100,000+ artists: bios, works, auction results",
 *   "Editorial: News, market analysis, studio visits, and explainers" (llms.txt).
 *   https://www.artsy.net/llms.txt
 * - Monitoring: homepage "Follow artists, explore stories, and get personalized recommendations";
 *   About page "Get the app, and be alerted about new artworks". The help center article "How To
 *   Create An Alert" describes alerts created from an artist or artwork page, for works added to
 *   Artsy, delivered in the Activity panel, by push and by email. It is a JavaScript-only page,
 *   read through a search excerpt, so re-check it by hand before changing the monitoring chapter.
 *   No frequency is published, so the page makes no speed comparison.
 *   https://www.artsy.net/
 *   https://www.artsy.net/about
 *   https://support.artsy.net/s/article/How-To-Create-An-Alert
 *   https://support.artsy.net/s/article/How-do-I-follow-an-artist
 */

/** Aura Historia vs Artsy: `/{lng}/compare/artsy`, copy in `compareArtsyPage.*`. */
export const ARTSY_COMPARISON = {
    slug: "artsy",
    routePath: "/$lng/compare/artsy",
    competitorName: "Artsy",
    namespace: "compareArtsyPage",
    metaKey: "compareArtsy",
    lastReviewed: ARTSY_COMPARISON_LAST_REVIEWED,
    // The dated, primary-sourced sentence on the Artsy and Artnet announcement.
    statusNote: true,
    quickVerdicts: [
        { key: "contemporaryGalleryArt", winner: "competitor" },
        { key: "antiquesAndDesign", winner: "aura" },
        { key: "providerTypes", winner: "aura" },
        { key: "monitoring", winner: "aura" },
    ],
    advantages: [
        { key: "antiquesAndDesign", icon: Armchair },
        { key: "providersBeyondOnePlatform", icon: Store },
        { key: "monitoringBeyondOneInventory", icon: Bell },
        { key: "languages", icon: Languages },
    ],
    scorecardRows: [
        { key: "galleryRelationships", winner: "competitor" },
        { key: "editorialContext", winner: "competitor" },
        { key: "sourceModel", winner: "aura" },
        { key: "antiquesAndDesign", winner: "aura" },
        { key: "crossProviderMonitoring", winner: "aura" },
        { key: "languageHandling", winner: "aura" },
    ],
    sources: {
        // The same ruled list of source types as the Barnebys comparison.
        sourceKeys: [
            "auctionHouses",
            "auctionPlatforms",
            "antiqueDealers",
            "privateSellers",
            "marketplaces",
        ],
        cards: [
            { key: "providersBeyondGalleries", icon: Network },
            { key: "offersSideBySide", icon: Layers },
            { key: "acrossLanguages", icon: Globe },
            { key: "watchAnObject", icon: Eye },
        ],
    },
    alerts: { icon: Bell },
    faqItems: [
        { key: "alternative", anchor: "faq-alternative" },
        { key: "replace", anchor: "faq-replace" },
        { key: "antiquesAndDesign", anchor: "faq-antiques-design" },
        { key: "galleryArt", anchor: "faq-gallery-art" },
        { key: "artnet", anchor: "faq-artnet" },
    ],
    structuredDataTopics: [
        "artSearch",
        "galleryMarketplace",
        "crossProviderSearch",
        "multilingualSearch",
        "monitoring",
    ],
    positioningKey: "compareArtsyPage.positioning",
} as const satisfies ComparisonDefinition;
