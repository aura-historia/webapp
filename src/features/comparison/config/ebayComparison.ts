import { Bell, Eye, Frame, Globe, Layers, Network, Route, Store } from "lucide-react";

import type { ComparisonDefinition } from "@/features/comparison/config/comparisonDefinition.ts";
import { EBAY_COMPARISON_LAST_REVIEWED } from "@/features/comparison/config/ebayComparisonReview.ts";

/*
 * Sources for the claims about eBay (all accessed 2026-11-09). Never render these as links: calls
 * to action stay internal and the page never links to a competitor.
 *
 * - What could be read: eBay's annual report for 2025, the Form 10-K for the year ended 31
 *   December 2025 (filed 2026-02-19, per the SEC's submissions index). The page cites it as "its
 *   annual report for 2025" wherever it uses it, because cells and FAQ answers are quoted on their
 *   own. The SEC answers undeclared scripted requests with a block page and asks for company
 *   contact details in the user agent, so the filing was read through the harness's fetch tool,
 *   which returns a model's summary of the page. Every passage below was asked for twice, in
 *   separate requests, and came back the same; the quotes are cut at 125 characters by that tool,
 *   so the page paraphrases and never quotes them. A maintainer should re-read the passages
 *   against the filing before relying on this file.
 *   https://www.sec.gov/Archives/edgar/data/1065088/000106508826000027/ebay-20251231.htm
 * - Reach: "At the end of 2025, eBay had 135 million active buyers and 2.5 billion live listings
 *   globally." An active buyer is "all buyer accounts that paid for a transaction on our
 *   Marketplace platforms within the previous 12-month period". The page gives both figures with
 *   the year and the source, and never a number more precise than that. It makes no size
 *   comparison: Aura Historia's own counts (a catalogue of listings, no buyers) do not measure the
 *   same thing.
 * - Self-description: eBay calls itself "a global commerce leader and third-party marketplace" and
 *   describes its marketplace as "one of the world's largest and most vibrant marketplaces for
 *   discovering great value and a unique selection". The page attributes the first half ("one of
 *   the world's largest") and leaves out "most vibrant", which is self-praise. It says eBay
 *   "connects buyers and sellers" ("commissions from the service of connecting buyers and
 *   sellers"), never that eBay "sells": the report does not say eBay takes title to items.
 * - Sellers: "Scalable Solutions empower sellers of all sizes, from individual entrepreneurs to
 *   global businesses". The issue's draft (Aura Historia's providers are "not mainly individual
 *   and general sellers") cannot be said against eBay, and the page does not: the provider-types
 *   row states the report's wording and then what Aura Historia indexes.
 * - Categories: collectibles are one of eBay's "Focus Categories, such as motor vehicles parts and
 *   accessories, collectibles, refurbished items, apparel, luxury goods and sneakers" (the list
 *   continues after "refurbished items"; the page says "such as" and names that list). The report
 *   does not mention antiques or art. The issue's other draft fact, that eBay's collectibles
 *   structure lists Antiques and Art as categories (www.ebay.com/b/Collectibles-Art/bn_7000259855),
 *   could not be verified: see "Not used" below. The page therefore says nothing about an antiques
 *   or art category on eBay, and calls eBay a marketplace "across many categories" (the Focus
 *   Categories above), where the issue's drafts say "general marketplace" and "sells everything".
 * - Buyer protection: "The eBay Money Back Guarantee program allows buyers to obtain a refund if
 *   an item does not arrive, is damaged or faulty" on most purchases completed through qualifying
 *   payment methods; "our Authenticity Guarantee program ... authenticating eligible luxury,
 *   collectible and high-value items across major geographical markets"; and "We offer
 *   authentication services, including our Authenticity Guarantee program, in certain markets".
 *   The page describes exactly that, attributes it ("describes"), gives no eligibility rule the
 *   report does not give, and keeps both programme names in English in every language (a French
 *   or Spanish name would be a translation of a programme name, not eBay's wording). It does NOT
 *   say that antiques and art are outside the Authenticity Guarantee: the report's wording
 *   ("collectible and high-value items") is broader than the issue's desk research, and the one
 *   official page that lists categories (below) speaks only of eBay's collectibles business. Nor
 *   is authenticity a point for Aura Historia (docs/product-context.md): the FAQ answer reuses
 *   the existing About-page wording.
 * - Languages: "Our Marketplace platforms, including our online marketplace located at
 *   www.ebay.com and its localized counterparts", and "Our technology empowers millions of buyers
 *   and sellers in more than 190 markets around the world". The report does not describe
 *   terminology or search across languages, so the row is a `tie` with "No difference
 *   documented" and the cell says what the report does not say. Never claim better or broader
 *   language support than eBay has: neither Aura Historia nor eBay is measured here.
 * - Used nowhere on the page, for the PR only: eBay's press release of 18 August 2026 ("eBay
 *   expands Authenticity Guarantee to collectible coins") says coins are "the second eligible
 *   category within eBay's collectibles business", after trading cards in 2022, for graded U.S.
 *   and World coins and raw U.S. coins priced at $500 or more, authenticated by PCGS, starting in
 *   the U.S. It does not mention bullion (the issue's draft says it is excluded) or antiques or
 *   art, and it does not list the programme's categories outside collectibles. The page therefore
 *   describes no category scope for the programme.
 *   https://www.ebayinc.com/stories/news/ebay-authenticity-guarantee-collectible-coins/
 * - Not used: eBay's own pages. www.ebay.com answered the fetch tool with 403 for the category
 *   page, and its robots.txt (version "v30.2_COM_August_2026") prohibits automated access without
 *   eBay's permission except for search-engine indexing; its search results are disallowed
 *   outright. Automated requests to ebay.com were stopped once the policy was read, and nothing
 *   from its help pages on the Money Back Guarantee, the Authenticity Guarantee, saved searches or
 *   alerts is on the page. A maintainer should read those pages in a browser before the page says
 *   more: the category structure, the programmes' terms, and saved searches and alerts. There is
 *   no monitoring row in the scorecard for that reason, and nothing on the page describes eBay's
 *   saved searches or alerts, or compares alert speed.
 * - eBay's interfaces, for the PR only: the robots.txt names eBay's official API (the developer
 *   programme) as the route for approved integrations; ebay.com/llms.txt answered 404 on
 *   2026-11-09. The page says nothing about eBay's APIs, agent interfaces or any other interface,
 *   and never says eBay lacks one. The shared AI-assistants side-note of the issue was dropped by
 *   the maintainer in #1274, so the page has none.
 * - Is eBay indexed as a provider (public MCP, 2026-11-09): `searchPublicListingSources` for
 *   "ebay" returns no provider, and the first page of the unfiltered list (50 providers, names
 *   from digits to "ABC") has none either, so the page claims no overlap and says nothing about
 *   eBay listings in Aura Historia. `getPublicOverview` reports 42 indexed providers, all dealers
 *   (0 auction houses, 0 marketplaces), while the provider list returns more than 42 on its first
 *   page. The two disagree, so the page keeps the wording of the maintainers' rule and the merged
 *   sibling pages (dealers, auction houses, shops and marketplaces); a maintainer should confirm.
 * - The cross-language test (research item 3) ran on the Aura Historia side only: eBay's search
 *   pages are off limits to automated requests. "Kommode Louis XV" in German returned
 *   French-catalogued commodes of Thuriot Antiquaire ("Epoche Louis XV" and "Ludwig XV");
 *   "secrétaire Biedermeier" in French returned a German-catalogued "Antiker Sekretär" and an
 *   English-catalogued Biedermeier corner cabinet, but no German listing called "Biedermeier
 *   Sekretär" exists to match; "credenza dell'Ottocento" in Italian and "Kredenz 19.
 *   Jahrhundert" in German returned English-catalogued Welsh dressers and sideboards, with no
 *   Italian-catalogued Ottocento credenza to match and no filtering by century. That supports
 *   "a search in one language can return objects catalogued in another" (the wording of the page,
 *   which the product docs already state), not a verdict over eBay: there is no cross-language
 *   quick verdict, and the languages row is a tie. The test is not named on the page.
 * - Aura Historia and payments: the Aura cell says Aura Historia does not sell objects or take
 *   payments "for them": the product bills subscriptions (`src/features/billing`), so a bare
 *   "takes no payments" would be wrong.
 * - Fees: left out on purpose; the page makes no fee comparison and the word is on the banned
 *   list.
 */

/** Aura Historia vs eBay: `/{lng}/compare/ebay`, copy in `compareEbayPage.*`. */
export const EBAY_COMPARISON = {
    slug: "ebay",
    routePath: "/$lng/compare/ebay",
    competitorName: "eBay",
    namespace: "compareEbayPage",
    metaKey: "compareEbay",
    lastReviewed: EBAY_COMPARISON_LAST_REVIEWED,
    quickVerdicts: [
        { key: "reachAndSelection", winner: "competitor" },
        { key: "artAntiquesDesign", winner: "aura" },
        { key: "dealersAndAuctionHouses", winner: "aura" },
        { key: "monitoring", winner: "aura" },
    ],
    advantages: [
        { key: "specialisedIndex", icon: Frame },
        { key: "providerTypes", icon: Store },
        { key: "terminologyAcrossLanguages", icon: Globe },
        { key: "monitoringAcrossProviders", icon: Bell },
    ],
    scorecardRows: [
        { key: "reachAndBuyerBase", winner: "competitor" },
        { key: "buyerProtection", winner: "competitor" },
        { key: "categoryFocus", winner: "aura" },
        { key: "providerTypes", winner: "aura" },
        { key: "languagesAndTerminology", winner: "tie" },
    ],
    sources: {
        // The same ruled list of source types as the Barnebys, Artsy, Invaluable, 1stDibs, LiveAuctioneers and Catawiki comparisons.
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
    // "Using both" replaces the alerts chapter on this page.
    together: { icon: Route },
    faqItems: [
        { key: "alternative", anchor: "faq-alternative" },
        { key: "replace", anchor: "faq-replace" },
        { key: "rareArt", anchor: "faq-rare-art" },
        { key: "everydayCollectibles", anchor: "faq-everyday-collectibles" },
        { key: "authenticity", anchor: "faq-authenticity" },
    ],
    structuredDataTopics: [
        "artSearch",
        "onlineMarketplace",
        "crossProviderSearch",
        "multilingualSearch",
        "monitoring",
    ],
    positioningKey: "compareEbayPage.positioning",
} as const satisfies ComparisonDefinition;
