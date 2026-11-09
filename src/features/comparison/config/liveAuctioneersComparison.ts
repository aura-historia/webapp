import { Bell, Eye, Globe, Languages, Layers, Network, Route, Store } from "lucide-react";

import type { ComparisonDefinition } from "@/features/comparison/config/comparisonDefinition.ts";
import { LIVE_AUCTIONEERS_COMPARISON_LAST_REVIEWED } from "@/features/comparison/config/liveAuctioneersComparisonReview.ts";

/*
 * Sources for the claims about LiveAuctioneers, The Saleroom and Lot-tissimo (all accessed
 * 2026-11-09). Never render these as links: calls to action stay internal and the page never links
 * to a competitor.
 *
 * - Ownership and the brand list: "ATG operates curated marketplaces that people trust for finding
 *   and selling items worth using again. We operate 10 marketplaces across two sectors, Arts &
 *   Antiques ("A&A") and Industrial & Commercial ("I&C")", with LiveAuctioneers, The Saleroom,
 *   Lot-tissimo, EstateSales.NET, Chairish and Pamono under A&A (Auction Technology Group plc,
 *   Annual Report 2025, the year ended 30 September 2025, "At a Glance"). Its history gives "2018:
 *   Acquisition of Lot-tissimo, the leading Arts & Antiques marketplace in Germany" and "2021:
 *   Acquisition of LiveAuctioneers in October 2021, extending ATG's offering into the North
 *   America Arts & Antiques market"; ATG's own history page dates the same two acquisitions 2018
 *   and 2021, and "2006: ATG launches first live bidding for art and antiques auctions on
 *   thesaleroom.com". The page states the shared ownership once, in the respect chapter, as a dated
 *   fact attributed to the annual report, and again in the FAQ answer on whether the three are
 *   related (FAQ answers are quoted on their own). It leaves out "leading", which is the group's
 *   self-description, and the other brands (the issue's draft lists Chairish and Pamono, which
 *   the page does not need). The Saleroom's footer reads "Copyright © Metropress Ltd, (t/a Auction
 *   Technology Group)" and Lot-tissimo's "Auction Technology Group Germany GmbH", which agrees.
 *   The 2021 announcement ("ATG to complete acquisition of LiveAuctioneers", 29 September 2021)
 *   calls Lot-tissimo a "German fine art and antiques marketplace"; the page repeats that as the
 *   group's description. It does not say which market The Saleroom serves: no primary page says
 *   so, so the issue's draft ("the UK and German markets") is cut to what is sourced.
 *   https://cdn.yano.digital/media/mbwjz4ak/atg-ar25_full.pdf
 *   https://www.auctiontechnologygroup.com/about-us/our-history/
 *   https://www.auctiontechnologygroup.com/news-media/press-releases/atg-to-complete-acquisition-of-liveauctioneers/
 * - Not on the page: a possible offer for ATG itself by Fitzwalter Capital ended in early February
 *   2026 with no offer made (reported by TipRanks and Investegate; ATG's own "Possible Offer" page
 *   gives no dates). It concerns the group's shareholders, not who operates the three brands, and
 *   the page says nothing on finances or ownership of the group.
 * - Group figures are not used: ATG's homepage and annual report give "3,900+" auction houses,
 *   26.8m lots and 457m web sessions for FY25 across all ten marketplaces; LiveAuctioneers' Sell
 *   page quotes the network's "106M+ buyers" and "28M+ monthly visits" and "Trusted by 4,000
 *   auction houses". The ATG "three times" figure from the Chairish deal is not used either.
 * - LiveAuctioneers' own figures conflict, so the page uses none: its company overview says "more
 *   than 1,600 of the world's trusted auction houses", its Sell page "4,000 auction houses
 *   globally" (undated, in a section that mixes network and brand figures), its app listing "5,000+
 *   auctioneers", and the 2020 resource-centre entry "5M+ monthly visits, 1.2M+ items sold, 120K
 *   new monthly bidders" for 2020. The page uses only the year "2002": the company overview says
 *   "Founded in 2002" and the Sell page "Since 2002".
 *   https://www.liveauctioneers.com/pages/company-overview/
 *   https://www.liveauctioneers.com/pages/sell/
 *   https://www.liveauctioneers.com/pages/resource-center/
 * - What LiveAuctioneers is and its audience: the company overview heads itself "North America's
 *   Most Trusted Online Auction Platform" and calls itself "the world's leading platform for live
 *   and timed auctions"; the resource centre for auctioneers is headed "Reach the Largest Bidder
 *   Audience in North America". The issue's draft ("North America's largest bidder audience") is
 *   the resource-centre heading. All of it is self-description, so the page says "describes", puts
 *   the audience in the scorecard row "Bidder audience, as each describes it" and gives the
 *   verdict to LiveAuctioneers, never calls LiveAuctioneers "leading" or "most trusted" in its
 *   own voice, and gives no figure for the audience. It also quotes the annual report's sentence
 *   that the acquisition extended ATG's offering into the North American arts and antiques market,
 *   naming Auction Technology Group in that cell because scorecard cells are quoted on their own.
 *   The issue asks the respect chapter to credit the platforms' role in bringing auction houses
 *   online. The company overview says "Founded in 2002, LiveAuctioneers is the world's leading
 *   platform for live and timed auctions of collectibles, antiques, and fine art, enabling more
 *   than 1,600 of the world's trusted auction houses to host auctions online". The page uses it as
 *   an attributed statement ("says it enables auction houses to host live and timed auctions
 *   online"), states the founding year as "founded in 2002" and leaves out "leading" and the 1,600.
 * - Bidding: the company overview says "live and timed auctions", and the data embedded in a
 *   search page lists the sale types "Live Auction", "Buy Now", "Timed+ Auction" and "Timed
 *   Auction" (search for "library table"; the rendered page shows no such filter, so the page does
 *   not call it one); the app listing says "Watch live
 *   auctions and bid live in real-time", "Place bids before auctions begin or watch auctions when
 *   they are live and bid in real-time" and "Get push notification alerts when items you save or
 *   bid on are almost up for auction". The Saleroom's FAQ: "Live auctions are traditional
 *   room-based auctions that are broadcast over the-saleroom.com", "Timed auctions take place
 *   without an auctioneer calling the sale". Lot-tissimo's FAQ (German): "lot-tissimo.com bietet
 *   Ihnen zwei Formen von Online Auktionen", live and timed ("zeitgesteuerte"). The page says
 *   bidders bid in live and timed auctions on all three and does not describe registration or
 *   payment, which it has not verified for LiveAuctioneers (its help centre blocks automated
 *   requests with 403).
 *   https://www.liveauctioneers.com/search/library-table/
 *   https://apps.apple.com/us/app/liveauctioneers-bid-auction/id321243082
 *   https://www.the-saleroom.com/en-gb/about-us/faqs
 *   https://www.lot-tissimo.com/de-de/about-us/faqs
 * - Fixed-price stock: LiveAuctioneers offers Buy Now listings next to its auction lots. Its resource
 *   centre for auction houses says "Our Buy-It-Now solution allows you to increase sales by
 *   offering unsold auction items for immediate sale on LiveAuctioneers" and "your unsold items
 *   will be automatically converted to Buy Now listings once your auction ends"; search results
 *   carry the sale type "Buy Now" (84 of 236 results for "library table" on 2026-11-09, a count
 *   that changes daily and is not on the page). The issue's draft ("dealers and fixed-price →
 *   Aura Historia") therefore cannot say LiveAuctioneers lacks fixed-price stock. The page says
 *   what holds: the scorecard row says "according to its resource centre for auction houses, Buy
 *   Now listings of unsold items" (the guide describes auction houses' unsold lots and does not say
 *   whether other sellers can list them), and Aura Historia's difference is that it searches the
 *   stock of dealers and shops on their own websites, which a platform does not show. The page
 *   never says the group has no list-price marketplace: its annual report calls Chairish "a
 *   leading list-price online marketplace" and says the acquisition offers "consumers the choice
 *   of auction and list price merchandise".
 *   https://www.liveauctioneers.com/pages/bidder-growth-guide/
 * - Providers: the sellers on LiveAuctioneers are "auction houses" in its company overview and
 *   "auctioneers" in its app listing, so the cell says "Auction houses that list on
 *   LiveAuctioneers". The issue's "other sellers" has no source and is not used. The annual report
 *   describes "atgXL: a cross-listing capability to enable sellers to list across multiple
 *   marketplaces" and, in the glossary, a tool for auctioneers to run timed auctions across ATG
 *   marketplaces and white-label sites. That is a group tool; the report does not say which brands
 *   take part, so the page does not credit it to LiveAuctioneers and says nothing about
 *   cross-listing. It also never says each brand is a separate catalogue.
 * - Monitoring: LiveAuctioneers' homepage and search pages offer "Follow this search" ("Be the first
 *   to hear about new items you love"); the mobile-bidding page for auction houses says its apps
 *   send "timely notifications for saved search matches, auction registration approvals, bid
 *   statuses and upcoming items"; the app listing says "Follow searches to be notified when
 *   matching items are added". The annual report says ATG "launched personalised alerts" in FY25.
 *   The Saleroom's and Lot-tissimo's Auction Alerts pages: "Receive emails when new lots are added
 *   to the-saleroom.com that match your interests", "We search catalogues daily and email you lots
 *   matching your interests" (Lot-tissimo, German: "Wir durchsuchen unsere Kataloge täglich"). The
 *   page says what each service's alerts cover (its own platform) and gives no cadence for any of
 *   them. The Saleroom and Lot-tissimo document a daily catalogue search; LiveAuctioneers'
 *   cadence is not in any page readable by automated requests (its help centre answers 403). A
 *   one-sided cadence would invite a speed comparison, which the shared rules keep off the pages,
 *   so Aura Historia's claim is scope (across providers), not speed.
 *   https://www.liveauctioneers.com/pages/mobile-bidding-software/
 *   https://www.the-saleroom.com/en-gb/auction-alerts
 *   https://www.lot-tissimo.com/de-de/auction-alerts
 * - Languages: LiveAuctioneers' About page says "With fascinating objects up for bid in more than 50
 *   countries—instantly translated to your language and currency—LiveAuctioneers is a worldwide
 *   marketplace"; its site declares `lang="en"` with `en` and `en-gb` alternates and its app
 *   listing gives "English" as the language, so the claim is a self-description and not a
 *   documented feature. The page paraphrases it ("says its objects are translated to your language
 *   and currency"): the original's "instantly" would be a speed claim, and the 50-countries figure
 *   is left out. The Saleroom's language menu (footer of its inner pages) offers English, Français,
 *   Deutsch and Italiano; Lot-tissimo's offers English and Deutsch. How any of the three treats
 *   terminology is not documented, so the row is a tie and the "terminology" statements only
 *   describe Aura Historia. The verdict line reads "No difference documented" and not "Both offer
 *   several languages": for LiveAuctioneers the only source is the About page's claim, which names
 *   no languages (its app listing says "English"), and the cell attributes it as a claim.
 *   https://www.liveauctioneers.com/about/
 *   https://www.the-saleroom.com/en-gb/about-us/faqs
 *   https://www.lot-tissimo.com/de-de/auction-alerts
 * - The h1: the issue's draft ("A search across the whole market, beyond a single auction
 *   platform") is a totality claim nobody can verify, so the page says "many providers". The final
 *   call to action keeps the issue's "a search across the market", as the Invaluable page does.
 * - Paid placement: omitted, as the issue's default. LiveAuctioneers advertises promotion
 *   packages to auction houses (https://www.liveauctioneers.com/pages/advertise/); that is a
 *   fact about its business and the page does not imply how results are ranked. Nothing on the
 *   page states that Aura Historia sells no placement: no maintainer has confirmed it.
 * - Fees and commissions: left out on purpose. No fee comparison.
 * - Which auction houses Aura Historia indexes (public MCP `searchPublicListingSources`, checked
 *   2026-11-09): none of LiveAuctioneers, The Saleroom, Lot-tissimo, Bonhams or Dorotheum is
 *   indexed as a provider by name, so the page claims no overlap. It says only what the product
 *   docs support: Aura Historia indexes auction houses, dealers, shops and marketplaces.
 * - Not on the page, for the PR only: the public MCP `getPublicOverview` (2026-11-09) reports 42
 *   indexed providers, all dealers (0 auction houses, 0 marketplaces), 1 country and 12 languages,
 *   while the provider list returns more than 50 providers from many countries on its first page.
 *   The two disagree, so the page keeps the wording of the maintainers' rule and the merged
 *   sibling pages ("auction houses, dealers and marketplaces"); a maintainer should confirm it.
 * - Not on the page, for the PR only: LiveAuctioneers publishes a `/llms.txt` (200); none of the
 *   three has `/.well-known/mcp/server-card.json`, `api-catalog` or `agent-card.json` (LiveAuctioneers
 *   returns 404, The Saleroom and Lot-tissimo redirect to an error page); their robots.txt files
 *   disallow `*.well-known*` for The Saleroom and Lot-tissimo. The page says nothing about their
 *   interfaces and never says they lack an AI-agent interface.
 */

/** Aura Historia vs LiveAuctioneers: `/{lng}/compare/liveauctioneers`, copy in `compareLiveauctioneersPage.*`. */
export const LIVE_AUCTIONEERS_COMPARISON = {
    slug: "liveauctioneers",
    routePath: "/$lng/compare/liveauctioneers",
    competitorName: "LiveAuctioneers",
    namespace: "compareLiveauctioneersPage",
    metaKey: "compareLiveauctioneers",
    lastReviewed: LIVE_AUCTIONEERS_COMPARISON_LAST_REVIEWED,
    // The dated, annual-report-sourced sentence on the three brands' shared operator.
    statusNote: true,
    quickVerdicts: [
        { key: "liveBidding", winner: "competitor" },
        { key: "searchAcrossProviders", winner: "aura" },
        { key: "dealerAndShopStock", winner: "aura" },
        { key: "monitoring", winner: "aura" },
    ],
    advantages: [
        { key: "oneSearchAcrossVenues", icon: Layers },
        { key: "moreThanAuctionLots", icon: Store },
        { key: "terminologyAcrossLanguages", icon: Languages },
        { key: "monitoringAcrossProviders", icon: Bell },
    ],
    scorecardRows: [
        { key: "liveBidding", winner: "competitor" },
        { key: "bidderAudience", winner: "competitor" },
        { key: "providerTypes", winner: "aura" },
        { key: "dealersAndFixedPrice", winner: "aura" },
        { key: "languageHandling", winner: "tie" },
        { key: "monitoring", winner: "aura" },
    ],
    sources: {
        // The same ruled list of source types as the Barnebys, Artsy, Invaluable and 1stDibs comparisons.
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
        { key: "saleroomAlternative", anchor: "faq-the-saleroom" },
        { key: "lotTissimoAlternative", anchor: "faq-lot-tissimo" },
        { key: "bid", anchor: "faq-bid" },
        { key: "related", anchor: "faq-related" },
    ],
    structuredDataTopics: [
        "artSearch",
        "auctionPlatform",
        "crossProviderSearch",
        "multilingualSearch",
        "monitoring",
    ],
    positioningKey: "compareLiveauctioneersPage.positioning",
} as const satisfies ComparisonDefinition;
