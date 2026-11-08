import { Bell, Eye, Gavel, Globe, Layers, Network, Scale, Store } from "lucide-react";

import type { ComparisonDefinition } from "@/features/comparison/config/comparisonDefinition.ts";
import { FIRST_DIBS_COMPARISON_LAST_REVIEWED } from "@/features/comparison/config/firstDibsComparisonReview.ts";

/*
 * Sources for the claims about 1stDibs (all accessed 2026-11-08). Never render these as links:
 * calls to action stay internal and the page never links to a competitor.
 *
 * - Figures: the annual report for the year ended 31 December 2025 (Form 10-K of 1stdibs.com,
 *   Inc., filed 27 February 2026, the latest 10-K) is the one source for every figure on the page.
 *   "As of December 31, 2025, we operate an e-commerce marketplace with approximately 5,700 unique
 *   sellers, compared to approximately 5,900 as of December 31, 2024" (Item 7, Company Overview)
 *   and "During the year ended December 31, 2025, we had approximately 60,700 active buyers",
 *   where "we define Active Buyers as unique buyers who made at least one purchase through our
 *   online marketplace" in the trailing 12-month period (Item 1, Company Overview). The page says
 *   "approximately", names the report and its year, and gives the buyer definition.
 *   https://www.sec.gov/Archives/edgar/data/1600641/000160064126000007/dibs-20251231.htm
 *   The seller application page says "more than 7,600+ of the world's best sellers and galleries
 *   from over 50 countries" and is undated; the 10-K says "over 70 countries" once, in a risk
 *   factor on regulated materials, and gives no overall country count. The seller figures conflict
 *   (7,600+ against 5,700) and the country figures conflict (50 against 70), so the page uses
 *   neither the undated page nor any country count. Wikipedia (4,000 dealers in 28 countries, 2019)
 *   and the third-party revenue analysis the issue says not to use are not used either.
 *   https://www.1stdibs.com/dealer/application-form/
 * - What 1stDibs is and how it describes vetting: "one of the world's leading online marketplaces
 *   for connecting design lovers" and "Our sellers, who undergo an evaluation by our in-house
 *   experts to vet the quality of their inventory" (10-K, Company Overview). The About page says
 *   "a leading online marketplace for extraordinary design", "our team of experts handpicks the
 *   finest to showcase" and sellers "each of whom has been thoroughly vetted by our in-house
 *   experts"; the application page says "We select only prestigious sellers and galleries". All of
 *   it is self-description, so the page says "says" and "describes" and never calls 1stDibs
 *   "leading". "Approved sellers" is the neutral reading of "select only" and "evaluation": the
 *   page does not describe the criteria, which 1stDibs does not publish on those pages.
 *   https://www.1stdibs.com/about/
 * - Buyer protection: "Our 1stDibs Promise gives our buyers peace of mind with every purchase" with
 *   a Money-Back Guarantee and an Authenticity Guarantee (10-K, The 1stDibs Marketplace, Trust);
 *   the Promise page lists the same ("contact us within 1 year", "within 7 days"). The page names
 *   the 1stDibs Promise and gives none of its terms: they are 1stDibs' to state, and the guarantee
 *   wording would read as a promise of Aura Historia's own.
 *   https://www.1stdibs.com/about/promise/
 * - Object range: "vintage, antique, and contemporary furniture, home décor, jewelry, watches, art,
 *   and fashion" (10-K, Company Overview). The scorecard quotes the range; the hero names only
 *   "among other things" furniture, jewellery and art.
 * - Auctions: the Auction Terms say "The Auction platform is a feature on the 1stdibs marketplace
 *   that allows Sellers to post an Item": sellers list an item for auction, buyers register with
 *   a card or PayPal account and bid, with maximum bids, a five-minute extension and an optional
 *   Buy It Now before the first bid. The terms carry no date. The About page and the Promise page
 *   mention no auctions, and the 10-K describes no auction offer, so the issue's draft ("check
 *   whether 1stDibs has auctions before claiming a difference") resolves to: it does, so the page
 *   claims no difference. The row is a tie, "different roles": 1stDibs lets its sellers run
 *   auctions on its marketplace, Aura Historia runs none. The page never says 1stDibs has no
 *   auction houses either: nothing says which sellers use the feature.
 *   https://www.1stdibs.com/about/auctions-terms/
 * - Monitoring: "alerts when new items from followed creators are listed" (10-K, Value Proposition
 *   to Buyers, Personalization). The help centre (Follow Search Results, Save Your Favorite Items)
 *   reportedly also covers following searches, categories and sellers and alerts on saved items,
 *   but it answers automated requests with 403, so it could only be read as search excerpts. The
 *   page therefore states only the annual report's sentence; re-check the help centre by hand
 *   before widening the monitoring row. No frequency is published, so the page makes no speed
 *   comparison.
 *   https://support.1stdibs.com/hc/en-us/articles/14516797762715-Follow-Search-Results
 * - Languages: "unveiling a localized site for France" so buyers can "browse and receive customer
 *   support in their local language" (release of 11 May 2022, www.1stdibs.com/fr) and a localized
 *   German site "last month" (release of 27 April 2022: "local language, currency, customer
 *   service and shipping"). Its current robots.txt lists /de/, /es/, /fr/ and /it/ paths, so the
 *   page says only that 1stDibs offers localized versions of its site, for example in German and
 *   French, according to those 2022 releases. It makes no claim on whether listings are
 *   translated or terminology is aligned: nothing documents it, so the row is a tie and the
 *   "terminology" statements only describe Aura Historia.
 *   https://investors.1stdibs.com/news/news-details/2022/1stDibs-Launches-Localized-Website-in-France-/default.aspx
 *   https://investors.1stdibs.com/news/news-details/2022/Leading-Online-Luxury-Marketplace-1stDibs-to-Expand-European-Presence/default.aspx
 *   https://www.1stdibs.com/robots.txt
 * - Fees and commissions: left out on purpose (the issue's default). No official 1stDibs fee page
 *   was read, so the page makes no fee comparison.
 * - Not on the page: finances, the 2026 results and leadership announcements, and anything on
 *   whether 1stDibs' prices are high or low. The page does not speculate on finances, ownership
 *   or direction, and says nothing on the value of sellers' objects beyond Aura Historia's own
 *   price history.
 * - Not on the page, for the PR only: no `/.well-known/mcp/server-card.json`, `api-catalog` or
 *   `agent-card.json` was found on 1stdibs.com (404); `llms.txt` returned 404 to one client and
 *   a JavaScript bot-challenge page to another, so it is unverified; robots.txt lists specific
 *   disallowed paths, a one-second crawl delay for ClaudeBot and a full disallow for PetalBot.
 *   The page says nothing about 1stDibs' interfaces.
 */

/** Aura Historia vs 1stDibs: `/{lng}/compare/1stdibs`, copy in `compare1stdibsPage.*`. */
export const FIRST_DIBS_COMPARISON = {
    slug: "1stdibs",
    routePath: "/$lng/compare/1stdibs",
    competitorName: "1stDibs",
    namespace: "compare1stdibsPage",
    metaKey: "compare1stdibs",
    lastReviewed: FIRST_DIBS_COMPARISON_LAST_REVIEWED,
    // No status note: the 2026 sources show no situation worth a dated sentence on this page.
    quickVerdicts: [
        { key: "curatedSellers", winner: "competitor" },
        { key: "searchAcrossProviders", winner: "aura" },
        { key: "comparingObjects", winner: "aura" },
        { key: "monitoring", winner: "aura" },
    ],
    advantages: [
        { key: "beyondOneStorefront", icon: Layers },
        { key: "comparingAcrossProviders", icon: Scale },
        { key: "auctionHousesAndDealers", icon: Gavel },
        { key: "watchingChanges", icon: Bell },
    ],
    scorecardRows: [
        { key: "curationAndVetting", winner: "competitor" },
        { key: "sellerModel", winner: "tie" },
        { key: "objectRange", winner: "aura" },
        { key: "crossProviderComparison", winner: "aura" },
        { key: "auctions", winner: "tie" },
        { key: "monitoring", winner: "aura" },
        { key: "languages", winner: "tie" },
    ],
    sources: {
        // The same ruled list of source types as the Barnebys, Artsy and Invaluable comparisons.
        sourceKeys: [
            "auctionHouses",
            "auctionPlatforms",
            "antiqueDealers",
            "privateSellers",
            "marketplaces",
        ],
        cards: [
            { key: "dealersAndShops", icon: Store },
            { key: "offersSideBySide", icon: Network },
            { key: "acrossLanguages", icon: Globe },
            { key: "watchAnObject", icon: Eye },
        ],
    },
    // "Comparing across providers" replaces the alerts chapter on this page.
    alerts: { icon: Scale },
    faqItems: [
        { key: "alternative", anchor: "faq-alternative" },
        { key: "replace", anchor: "faq-replace" },
        { key: "vetting", anchor: "faq-vetting" },
        { key: "comparePrices", anchor: "faq-compare-prices" },
    ],
    structuredDataTopics: [
        "artSearch",
        "curatedMarketplace",
        "crossProviderSearch",
        "priceComparison",
        "monitoring",
    ],
    positioningKey: "compare1stdibsPage.positioning",
} as const satisfies ComparisonDefinition;
