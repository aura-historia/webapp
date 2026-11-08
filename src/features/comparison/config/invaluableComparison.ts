import { Bell, Globe, Languages, Layers, Network, Route, Store, Eye } from "lucide-react";

import type { ComparisonDefinition } from "@/features/comparison/config/comparisonDefinition.ts";
import { INVALUABLE_COMPARISON_LAST_REVIEWED } from "@/features/comparison/config/invaluableComparisonReview.ts";

/*
 * Sources for the claims about Invaluable (all accessed 2026-11-08). Never render these as links:
 * calls to action stay internal and the page never links to a competitor.
 *
 * - Ownership: "Liquidity Services (NASDAQ:LQDT) … today announced that it has completed the
 *   acquisition of Auction Holdings, Inc., which operates Invaluable, AuctionZip, and RFC Auction
 *   Systems" (GlobeNewswire release dated 1 October 2026, copied to Invaluable's newsroom). The
 *   page states this once, in the respect chapter, as a dated fact. The release also quotes
 *   Invaluable's CEO on plans (a faster product roadmap in shipping and payments, AI, keeping the
 *   Invaluable and AuctionZip brands); the page repeats none of them, because it does not predict
 *   what the change means for the service, its fees or its roadmap. The base price ($80 million
 *   in cash) is left out as well: it adds nothing for a reader choosing where to search.
 *   https://www.invaluable.com/inv/newsroom/2026/10/01/liquidity-services-acquires-invaluable-marketplace/amp/
 * - Reach: "the Invaluable and AuctionZip businesses that serve thousands of auction houses and
 *   provide access to approximately four million registered bidders globally, processing more than
 *   $500 million of gross merchandise sales through their platform for their most recent fiscal
 *   year ended December 31, 2025". All three figures describe both businesses together, not
 *   Invaluable alone, and the page says so. The older "5,000+ auction houses" is not used.
 *   The release's boilerplate also says "more than four million collectors" for Invaluable alone;
 *   the page uses the combined sentence above, which is the one with a date.
 *   Same release.
 * - What Invaluable is: "a trusted, leading global online auction marketplace and suite of
 *   technology solutions" and "the world's leading online marketplace and technology platform for
 *   estate, fine art, antiques and collectibles auctions". Both are self-descriptions; the page
 *   only says that Invaluable describes itself as a marketplace for such auctions, never "leading".
 *   Same release.
 * - AuctionZip: "operates a U.S.-focused online auction marketplace and directory that connects
 *   local and regional auctioneers with millions of buyers". Same release.
 * - Pricing data: "The platform's proprietary pricing data developed over two decades is offered
 *   via a subscription service". The Price Archive is "an expansive database of prices realized
 *   spanning decades of auction sales from all over the world"; an account is needed, and "certain
 *   advanced search functionality and auction information may require a subscription". The page
 *   treats this as complementary to Aura Historia's listing price history, not as a rival.
 *   Same release; https://www.invaluable.com/inv/help/faq/search-price-archive/
 * - Bidding: the homepage offers "Register to bid" and "Enter Live Auction"; "Invaluable bidders
 *   gain access to an exclusive online bidding console … equipped with tools like language
 *   translation and currency conversion". The help centre describes live and timed auctions.
 *   Payment is NOT described as taking place on Invaluable: "Each individual auction house on the
 *   Invaluable platform determines their preferred method of payment", invoices come "from the
 *   auction house or from Invaluable", and card payment through Invaluable is offered only by
 *   "participating auction houses". The issue's draft ("register, bid and pay on its platform")
 *   therefore overstates it, and the page says only that bids are placed on Invaluable.
 *   https://www.invaluable.com/ and https://www.invaluable.com/inv/how-to-bid/
 *   https://www.invaluable.com/inv/help/faq/payments/
 * - Monitoring: saved searches ("Save to my Saved Searches"), saved lots (an alert the day before
 *   the auction), keyword alerts ("Follow this Keyword"), artist alerts, and following Keywords,
 *   Artists, Sellers or Categories; the apps send notifications when a saved lot is "5 lots away"
 *   or "closing in 5 minutes". No cadence is published for how soon a new match is emailed, so the
 *   page makes no speed comparison and no claim about what Invaluable's alerts cannot do.
 *   https://www.invaluable.com/inv/help/faq/search-price-archive/
 *   https://www.invaluable.com/inv/help/faq/emails-alerts/
 * - Languages and currencies: the release calls Invaluable's platform "multi-currency,
 *   multi-lingual", and its bidding console offers language translation and currency conversion.
 *   Its terms say translated versions come from Google Translate, are not legally binding and that
 *   "the original lot description in the auction catalogue provided by the AH is the official
 *   Content"; the page leaves that out and scores the row as a tie, because both services
 *   translate and the difference is Aura Historia's aligned terminology, which is not a
 *   measurable advantage. The website declares `<html lang="en">` and has no hreflang alternates;
 *   the page makes no claim about the interface language.
 *   https://www.invaluable.com/inv/how-to-bid/ and https://www.invaluable.com/inv/agreements/
 * - Fees: left out on purpose (the issue's default). Buyer's premium is set per auction house; the
 *   payments help shows only worked examples.
 *   https://www.invaluable.com/inv/help/faq/payments/
 * - Not on the page, recorded in the PR: Invaluable publishes no `llms.txt` (404), no
 *   `/.well-known/mcp/server-card.json`, `api-catalog` or `agent-card.json` (404) and no AI
 *   directives in `robots.txt`, which forbids automated access without permission. It documents a
 *   Catalog Upload API for auction houses and their software partners at
 *   https://www.invaluable.com/inv/apiinfo/. The page says nothing about Invaluable's interfaces.
 */

/** Aura Historia vs Invaluable: `/{lng}/compare/invaluable`, copy in `compareInvaluablePage.*`. */
export const INVALUABLE_COMPARISON = {
    slug: "invaluable",
    routePath: "/$lng/compare/invaluable",
    competitorName: "Invaluable",
    namespace: "compareInvaluablePage",
    metaKey: "compareInvaluable",
    lastReviewed: INVALUABLE_COMPARISON_LAST_REVIEWED,
    // The dated, primary-sourced sentence on the acquisition of Auction Holdings, Inc.
    statusNote: true,
    quickVerdicts: [
        { key: "onlineBidding", winner: "competitor" },
        { key: "searchAcrossVenues", winner: "aura" },
        { key: "dealerAndFixedPrice", winner: "aura" },
        { key: "monitoring", winner: "aura" },
    ],
    advantages: [
        { key: "moreThanAuctionLots", icon: Store },
        { key: "oneSearchAcrossVenues", icon: Layers },
        { key: "terminologyAcrossLanguages", icon: Languages },
        { key: "monitoringAcrossProviders", icon: Bell },
    ],
    scorecardRows: [
        { key: "onPlatformBidding", winner: "competitor" },
        { key: "auctionHouseReach", winner: "competitor" },
        { key: "providerTypes", winner: "aura" },
        { key: "dealersAndFixedPrice", winner: "aura" },
        { key: "monitoring", winner: "aura" },
        { key: "priceData", winner: "tie" },
        { key: "languageHandling", winner: "tie" },
    ],
    sources: {
        // The same ruled list of source types as the Barnebys and Artsy comparisons.
        sourceKeys: [
            "auctionHouses",
            "auctionPlatforms",
            "antiqueDealers",
            "privateSellers",
            "marketplaces",
        ],
        cards: [
            { key: "dealersAndShops", icon: Network },
            { key: "offersSideBySide", icon: Layers },
            { key: "acrossLanguages", icon: Globe },
            { key: "watchAnObject", icon: Eye },
        ],
    },
    // "How the two fit together" replaces the alerts chapter on this page.
    together: { icon: Route },
    faqItems: [
        { key: "alternative", anchor: "faq-alternative" },
        { key: "replace", anchor: "faq-replace" },
        { key: "bid", anchor: "faq-bid" },
        { key: "dealersAndFixedPrice", anchor: "faq-dealers-fixed-price" },
        { key: "auctionZip", anchor: "faq-auctionzip" },
    ],
    structuredDataTopics: [
        "artSearch",
        "auctionMarketplace",
        "crossVenueSearch",
        "multilingualSearch",
        "monitoring",
    ],
    positioningKey: "compareInvaluablePage.positioning",
} as const satisfies ComparisonDefinition;
