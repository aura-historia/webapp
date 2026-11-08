import { Bell, Globe, Languages, Layers, Network, Route, Store, Eye } from "lucide-react";

import type { ComparisonDefinition } from "@/features/comparison/config/comparisonDefinition.ts";
import { INVALUABLE_COMPARISON_LAST_REVIEWED } from "@/features/comparison/config/invaluableComparisonReview.ts";

/*
 * Sources for the claims about Invaluable (all accessed 2026-11-08). Never render these as links:
 * calls to action stay internal and the page never links to a competitor.
 *
 * - Ownership: "Liquidity Services (NASDAQ:LQDT) … today announced that it has completed the
 *   acquisition of Auction Holdings, Inc., which operates Invaluable, AuctionZip, and RFC Auction
 *   Systems" (release dated 1 October 2026, GLOBE NEWSWIRE dateline, copied to Invaluable's
 *   newsroom). The issuer is Liquidity Services, so every sentence that relies on the release
 *   says "Liquidity Services' announcement". The page states the acquisition once, in the respect
 *   chapter, as a dated fact. The release also quotes Invaluable's CEO on plans (a faster product
 *   roadmap in shipping and payments, AI, keeping the Invaluable and AuctionZip brands); the page
 *   repeats none of them, because it does not predict what the change means for the service, its
 *   fees or its roadmap. The base price ($80 million in cash) is left out as well: it adds nothing
 *   for a reader choosing where to search.
 *   https://www.invaluable.com/inv/newsroom/2026/10/01/liquidity-services-acquires-invaluable-marketplace/amp/
 * - Reach: "the Invaluable and AuctionZip businesses that serve thousands of auction houses and
 *   provide access to approximately four million registered bidders globally, processing more than
 *   $500 million of gross merchandise sales through their platform for their most recent fiscal
 *   year ended December 31, 2025". The bidders and sales figures are stated only for both
 *   businesses together, not for Invaluable alone, and the page says so (respect chapter and the
 *   reach row). "Thousands of auction houses" is also stated for Invaluable alone ("power the
 *   management and sale of … items for thousands of auction houses and millions of collectors";
 *   "from thousands of the world's premier traditional auction houses"), which is why the hero
 *   subtitle can use it for Invaluable. Invaluable's own pages disagree on the count (About:
 *   "over 5,000", the getting-started help: "more than 4,000", the release: "thousands"), so the
 *   page uses "thousands" and no number; the older "5,000+" is not used. The release's boilerplate
 *   also says "more than four million collectors" for Invaluable alone; the page uses the combined,
 *   dated sentence above. Same release.
 * - What Invaluable is: "a trusted, leading global online auction marketplace and suite of
 *   technology solutions" and "the world's leading online marketplace and technology platform for
 *   estate, fine art, antiques and collectibles auctions". Both are self-descriptions; the page
 *   only says that Invaluable describes itself as a marketplace for such auctions, never
 *   "leading". "Established" in the page's own voice rests on "for more than twenty years" and
 *   "decades" in the same release. The terms call Invaluable "only a venue", which supports
 *   "venue". Same release; https://www.invaluable.com/inv/agreements/
 * - AuctionZip: "operates a U.S.-focused online auction marketplace and directory that connects
 *   local and regional auctioneers with millions of buyers". Same release.
 * - Providers beyond auction houses: the getting-started help says Invaluable is "working with more
 *   than 4,000 of the world's premier auction houses, dealers and galleries", offers "a fixed-price
 *   retail platform", lets an account "purchase 'Buy Now' items" and "send messages directly to
 *   Invaluable's auction house, gallery and dealer partners". The text carries 2015 and 2016
 *   awards, so it may be older than the product. The page therefore never says Invaluable has no
 *   dealers or fixed-price items: the provider and dealer rows quote what its help centre says,
 *   attributed, and the advantage for Aura Historia is stated as searching the stock of dealers
 *   and shops on their own websites in one place.
 *   https://www.invaluable.com/inv/help/faq/getting-started/
 * - Pricing data: "The platform's proprietary pricing data developed over two decades is offered
 *   via a subscription service". The Price Archive is "an expansive database of prices realized
 *   spanning decades of auction sales from all over the world"; an account is needed, "certain
 *   advanced search functionality and auction information may require a subscription", a free
 *   account sees up to 12 months of past prices, Premium five years and Professional 15+. The page
 *   treats this as complementary to Aura Historia's listing price history, not as a rival.
 *   Same release; https://www.invaluable.com/inv/help/faq/search-price-archive/
 * - Bidding: the homepage offers "Register to bid" and "Enter Live Auction". Registration is a
 *   request to the auction house ("Approval to bid in any Invaluable sale is at the auction house's
 *   discretion"). Live auctions run in "an exclusive online bidding console … equipped with tools
 *   like language translation and currency conversion"; timed auctions are "available for
 *   absentee bidding only", so the console and its tools are attributed to live auctions only.
 *   Payment is NOT described as taking place on Invaluable: "Each individual auction house on the
 *   Invaluable platform determines their preferred method of payment", invoices come "from the
 *   auction house or from Invaluable", and card payment through Invaluable is offered only by
 *   "participating auction houses". The issue's draft ("register, bid and pay on its platform")
 *   therefore overstates it, and the page says only that bids are placed on Invaluable and that
 *   each auction house sets its payment methods.
 *   https://www.invaluable.com/ , https://www.invaluable.com/inv/how-to-bid/
 *   https://www.invaluable.com/inv/help/faq/auctions-registration/
 *   https://www.invaluable.com/inv/help/faq/payments/
 * - Monitoring: "Follow this Keyword" (email alerts for keywords), artist alerts, a Following list
 *   of Keywords, Artists, Sellers and Categories, an email alert the day before an auction for a
 *   saved lot, and app notifications when a saved lot is "5 lots away" or "closing in 5 minutes".
 *   "Save to my Saved Searches" exists, but no alert is documented for a saved search, so the page
 *   does not say saved searches send alerts. No cadence is published for how soon a new match is
 *   emailed, so the page makes no speed comparison. The page says Invaluable's alerts concern
 *   what is listed on Invaluable and claims nothing about what they cannot do.
 *   https://www.invaluable.com/inv/help/faq/search-price-archive/
 *   https://www.invaluable.com/inv/help/faq/emails-alerts/
 * - Languages and currencies: the release calls Invaluable's platform "multi-currency,
 *   multi-lingual", and the how-to-bid page offers bidders "tools like language translation and
 *   currency conversion". Its terms say translated versions come from Google Translate, are not
 *   legally binding and that "the original lot description in the auction catalogue provided by
 *   the AH is the official Content"; the page leaves that out. The row is a tie because both
 *   services translate, and how Invaluable's translation treats terminology is not documented, so
 *   no advantage can be claimed. The "terminology across languages" advantage card only states
 *   what Aura Historia does. The website declares `<html lang="en">` and has no hreflang
 *   alternates; the page makes no claim about the interface language.
 *   https://www.invaluable.com/inv/how-to-bid/ and https://www.invaluable.com/inv/agreements/
 * - Fees: left out on purpose (the issue's default). Buyer's premium is set per auction house; the
 *   payments help also describes an online-fee component, a minimum amount and a "Buyer's Premium
 *   Parity" option, none of which the page mentions.
 *   https://www.invaluable.com/inv/help/faq/payments/
 * - Not on the page: Invaluable publishes no `llms.txt` (404), no
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
