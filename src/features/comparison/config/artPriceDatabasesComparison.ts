import { Bell, Clock, History, Layers, Route, Search, Store, Tag } from "lucide-react";

import { ART_PRICE_DATABASES_COMPARISON_LAST_REVIEWED } from "@/features/comparison/config/artPriceDatabasesComparisonReview.ts";
import type { ComparisonDefinition } from "@/features/comparison/config/comparisonDefinition.ts";

/*
 * Sources for the claims about the art price databases (all accessed 2026-11-09). Never render
 * these as links: calls to action stay internal and the page never links to a competitor.
 *
 * The "competitor" is a category of tool, not one product, so a claim names the product it comes
 * from. Where the four differ the page says "some" and names which. No figure is added up or set
 * against another or against Aura Historia's own counts: the four count different things.
 *
 * What could be read, and what could not (nothing was worked around):
 * - robots.txt of artnet.com, worthpoint.com, mutualart.com and artprice.com were read first. Each
 *   allows its public marketing pages to generic agents (Artnet's file carries "Content-Signal:
 *   search=yes, ai-train=no, use=reference"; the page is written by hand from facts and trains
 *   nothing). Artprice and WorthPoint name AI crawlers; the fetch tool's agent is none of them.
 * - Read: artnet.com/price-database/, mutualart.com (homepage, /plans, /llms.txt), the Artsy and
 *   Artnet release on PR Newswire, WorthPoint's results release of January 2022 (PR Newswire,
 *   syndicated), Artmarket.com's release of 2026-11-09 for Artprice, Masterworks' article.
 * - 403 for the fetch tool, so nothing from them is on the page: worthpoint.com (homepage),
 *   artnet.com/help/faq/price-database, artnet.com/market-alerts/, artnet.com/llms.txt,
 *   news.artnet.com (the takeover article). artprice.com answered with a browser check and no
 *   content, so no Artprice page was read. Maintainers: read the WorthPoint homepage, the Artnet
 *   FAQ and Market Alerts pages and Artprice's subscription pages in a browser before the page says
 *   more about them.
 * - The fetch tool returns a model's summary of a page and cuts quotes at 125 characters, so every
 *   passage below was asked for with the rest of any cut sentence; a maintainer should re-read
 *   them against the pages.
 *
 * Artnet (the Price Database)
 * - "18 million auction results, verified by specialists" (the Artnet FAQ, which answers 403 here,
 *   is reported to say "about 18 million", so the page says "about 18 million"); auction records
 *   "dating back to 1985";
 *   two databases, Fine Art and Design, and Decorative Art ("antiques, antiquities, and
 *   collectibles"); "Upcoming auctions are included in both databases"; plans of different search
 *   and result allowances (a one-day pass, individual, expert and appraiser plans for Fine Art and
 *   Design; monthly and annual plans for Decorative Art). The product is "The Artnet Price
 *   Database" / "Price Database". Prices are not on the page and member offers are never used.
 *   https://www.artnet.com/price-database/
 * - Market Alerts are named in the navigation as "a tool that keeps you ahead of the art market".
 *   No readable page says what they cover, so the page says only that Artnet lists them.
 *   https://www.artnet.com/price-database/
 * - Name after the combination with Artsy (research item 5): the release of 15 April 2026 (with
 *   its correction from "ownership" to "leadership") says the two "have joined forces ... under
 *   shared leadership and vision", that both "will continue to operate as distinct brands and
 *   websites", and still names "Artnet Price Database" first among Artnet's services. The page
 *   says "shared leadership" and never owned, bought or merged, as the Artsy page does.
 *   https://www.prnewswire.com/news-releases/artsy-and-artnet-leaders-of-the-art-world-online-join-forces-to-transform-the-future-of-the-industry-302742420.html
 *
 * MutualArt
 * - "over 985,000 artists" (homepage and plans page); the title tag says "900k+" and /llms.txt
 *   "over 900,000", so the page says "more than 900,000", which every page supports.
 *   https://www.mutualart.com/ https://www.mutualart.com/plans https://www.mutualart.com/llms.txt
 * - Alerts: "email alerts" for followed "artists, venues and locations" on all plans, and "Art
 *   Market Alerts" for followed artists (plans page). Tier names, allowances and prices are left
 *   out (the word "premium" is also on the banned list).
 *   https://www.mutualart.com/plans
 * - Appraisals (this is why the issue's "valuation: neither" row is not kept): the homepage offers
 *   online appraisals ("Our expert appraisals help to quickly and conveniently assess the value of
 *   the art you own"), /llms.txt lists "Professional valuation services with 72-hour turnaround".
 *   The page says only that MutualArt describes online appraisals and gives no turnaround.
 *   https://www.mutualart.com/ https://www.mutualart.com/llms.txt
 * - Works for sale and upcoming lots (research item 3, why the dealer-and-marketplace row is
 *   dropped, together with Artprice's marketplace below): the homepage and /llms.txt list artworks
 *   for sale ("Available works for sale from Partner galleries") and "Upcoming lots from 20,000+
 *   auction houses worldwide". The page says MutualArt lists artworks for sale and upcoming auction
 *   lots, and uses no count.
 *   https://www.mutualart.com/llms.txt
 *
 * Artprice
 * - Artmarket.com's release of 2026-11-09: databanks of "over 30 million indices and auction
 *   results, covering more than 930,000 Artists", "auction traceability since 1700", enriched from
 *   "7,200 Auction Houses"; subscription plans ("Premium" and "Professional") and a "global
 *   subscriber base". The draft's "back to 1962" (a library guide, repeated by Masterworks) is not
 *   Artprice's own figure and is not used. The page uses the parent company's wording ("indices
 *   and auction results"), attributes it to Artprice's parent company and dates it. The 7,200 and
 *   930,000 are left out: a reader would add them to the others.
 *   https://www.finanzwire.com/press-release/artmarketcom-epa-prc-artmarketcom-artprice-q3-2026-revenue-up-global-rollout-in-early-december-2026-of-artprice-visual-searchr-the-quantum-leap-of-30-years-of-ai-first-strategy-bcOFNoNi8zu
 * - Marketplace (found in review): the release's "About Artmarket.com" section describes "the
 *   world's first Standardized Marketplace(R) for buying and selling works of Art" with listings "at
 *   fixed prices or at auction". The page says only that Artprice's parent company "describes a
 *   marketplace for works at fixed prices or at auction" (November 2026), never the superlative,
 *   so the currentAvailability cell does not read as selective. Same release, same URL.
 * - Not used: artprice.com itself (browser check, no content). The release's own words about the
 *   "valuation power of the tool" describe its search tool and are not an appraisal service, so
 *   nothing about valuation is said of Artprice. An SIA library guide gives Artprice's coverage as
 *   "from 1987", with 1700 to 1900 taken from a reference dictionary: so "auction traceability
 *   since 1700" is attributed to the parent company and appears once, in the respect chapter,
 *   never in a scorecard cell or an FAQ answer.
 *
 * WorthPoint
 * - "more than 610 million archived prices" and "nearly 1.3 billion images", data from "online
 *   marketplaces, including eBay and leading auction houses", annual subscriptions: WorthPoint's
 *   results release of 27 January 2022. Only the first figure is used, with its year, because the
 *   issue's other figures (a billion photographs, "from 2006 onwards", 500+ auction houses, about
 *   $29 a month) come from the homepage, which answers 403, and the release gives no start year.
 *   The page calls it WorthPoint's "January 2022 results announcement", never a current count.
 *   https://www.wfmz.com/news/pr_newswire/pr_newswire_business/worthpoint-announces-steady-growth-in-fourth-quarter-2021-marking-20th-consecutive-quarter-of-revenue-increase/article_3ca297d6-1386-5bcf-93de-404bd9b935d5.html
 * - Alerts: the release does not mention them, so nothing is said about WorthPoint's alerts. A
 *   search summary of the homepage gave two different sizes (610 million and about a billion), so
 *   even there the homepage does not agree with itself.
 *
 * The category
 * - Masterworks groups Artnet, Artprice, AskART and MutualArt as "price-lookup databases" that
 *   "exist to answer one question well: what did this work, or one like it, sell for"
 *   (published 2026-07-16; Masterworks sells art investments, so it is a pointer for the category
 *   framing only and is not on the page). Artnet's own page calls its database "the world's most
 *   comprehensive record of art sales": the page attributes no superlative and says "record what
 *   objects sold for", which the databases' own descriptions of auction results support, with the
 *   upcoming lots and works for sale above named where they exist.
 *   https://www.masterworks.com/academy/posts/how-masterworks-research-database-compares-to-other-art-market-data-sources
 * - Paid access: Artnet (plans), MutualArt (plans), WorthPoint (annual subscriptions, 2022) and
 *   Artprice (subscription plans, 2026) each describe paid access, so the access-model row says
 *   "paid plans or subscriptions" and compares no price.
 *
 * Aura Historia (checked on the product and the code, 2026-11-09)
 * - A listing page shows a price history chart and a history timeline: both are the listing's own
 *   changes since "First recorded by Aura Historia" (`product.history.events.listingDiscovered`,
 *   `ProductPriceChart`, `ProductEventHistory`), never market results. Availability includes
 *   "Sold out", withdrawn listings carry a hint, and where a sale was observed the price is
 *   labelled "Observed sale price" (`product.saleObservationPrice`, `priceValuation:
 *   SALE_OBSERVATION`). Sold-out listings do appear in public search (checked through the public
 *   MCP). That is the whole answer to "Does Aura Historia show past auction results?": not as a
 *   results database.
 * - Similar items on a listing page come from the same provider (20 of 20 for a sample listing,
 *   through the public MCP; the 1stDibs page found the same), so the page says search results show
 *   many providers side by side and never that similar items cross providers.
 * - Searching needs no account (existing FAQ copy); watchlists, saved searches and notifications
 *   need one. No valuations (`docs/product-context.md`).
 * - Providers: the public overview lists 42 indexed providers, all dealers, while the maintainers'
 *   rule and the merged sibling pages say dealers, auction houses, shops and marketplaces. The page
 *   keeps the maintainers' wording; a maintainer should confirm.
 * - The AI-assistants side-note and its FAQ entry from the issue were dropped by the maintainer in
 *   #1274, so the page has neither. Research item 6, for the PR only: MutualArt publishes an
 *   /llms.txt (an AI usage policy that asks for attribution with a link, forbids training without
 *   a commercial licence and says valuations are volatile); artnet.com/llms.txt answered 403; no
 *   API or agent interface was found on any readable page. The page says nothing about any
 *   interface of these products and never says one lacks it.
 */

/**
 * Aura Historia vs art price databases: `/{lng}/compare/art-price-databases`, copy in
 * `compareArtPriceDatabasesPage.*`.
 *
 * The competitor is a category, so `competitorName` lists the four brands (names are not
 * translated, and the footer and cross-link block print it after "Aura Historia vs").
 */
export const ART_PRICE_DATABASES_COMPARISON = {
    slug: "art-price-databases",
    routePath: "/$lng/compare/art-price-databases",
    competitorName: "Artnet, WorthPoint, MutualArt, Artprice",
    namespace: "compareArtPriceDatabasesPage",
    metaKey: "compareArtPriceDatabases",
    lastReviewed: ART_PRICE_DATABASES_COMPARISON_LAST_REVIEWED,
    statusNote: true,
    quickVerdicts: [
        { key: "pastResults", winner: "competitor" },
        { key: "offeredNow", winner: "aura" },
        { key: "watchingChanges", winner: "aura" },
        { key: "alerts", winner: "tie" },
    ],
    advantages: [
        { key: "offeredNow", icon: Store },
        { key: "askingPrices", icon: Tag },
        { key: "watchingChanges", icon: Bell },
        { key: "noAccount", icon: Search },
    ],
    scorecardRows: [
        { key: "historicalDepth", winner: "competitor" },
        { key: "currentAvailability", winner: "aura" },
        { key: "alerts", winner: "tie" },
        { key: "valuation", winner: "competitor" },
        { key: "accessModel", winner: "tie" },
    ],
    // "What each answers" replaces the source-types chapter on this page.
    sources: {
        sourceKeys: [
            "pastSale",
            "artistResults",
            "offeredNow",
            "listingChanges",
            "acrossProviders",
        ],
        cards: [
            { key: "pastResults", icon: History },
            { key: "currentOffers", icon: Store },
            { key: "listingHistory", icon: Clock },
            { key: "similarObjects", icon: Layers },
        ],
    },
    // "Using both" replaces the alerts chapter on this page.
    together: { icon: Route },
    faqItems: [
        { key: "alternativeArtnet", anchor: "faq-artnet-alternative" },
        { key: "alternativeWorthPoint", anchor: "faq-worthpoint-alternative" },
        { key: "alternativeArtpriceMutualArt", anchor: "faq-artprice-mutualart-alternative" },
        { key: "worth", anchor: "faq-valuation" },
        { key: "similarOffers", anchor: "faq-similar-offers" },
        { key: "pastResults", anchor: "faq-past-results" },
    ],
    structuredDataTopics: ["priceDatabases", "auctionResults", "crossProviderSearch", "monitoring"],
    positioningKey: "compareArtPriceDatabasesPage.positioning",
} as const satisfies ComparisonDefinition;
