import { Bell, Eye, Frame, Globe, Layers, Network, Route, Store } from "lucide-react";

import { CATAWIKI_COMPARISON_LAST_REVIEWED } from "@/features/comparison/config/catawikiComparisonReview.ts";
import type { ComparisonDefinition } from "@/features/comparison/config/comparisonDefinition.ts";

/*
 * Sources for the claims about Catawiki (all accessed 2026-11-09). Never render these as links:
 * calls to action stay internal and the page never links to a competitor.
 *
 * - What could be read: www.catawiki.com answers every automated request with 403 (its About
 *   page, help centre, homepage and stories pages; tried with the standard fetch tool, no
 *   workaround). The claims below therefore rest on the two legal documents Catawiki publishes as
 *   PDFs on its CDN, both headed "Valid from 18 March 2024". The page names that date wherever it
 *   cites them ("in the version of 18 March 2024"), because a newer version may exist and "valid
 *   from" does not say the text is current. Nothing that only the blocked pages could confirm is
 *   on the page; see the bullets below.
 *   https://cdn.catawiki.net/assets/marketing/terms/2024/terms/20240318_Terms_of_Use_EN.pdf
 *   https://cdn.catawiki.net/assets/marketing/terms/2024/buyer-13-13/20240318_Buyer_Terms_EN.pdf
 * - What Catawiki is and its weekly rhythm: Terms of Use, opening paragraph: "Catawiki is the
 *   leading online marketplace for special objects that fulfil people's passions. Over 75,000
 *   objects are offered in auction every week - each selected by our in-house experts." Article 8:
 *   "On Catawiki, we run online auctions of special objects." The page says "over 75,000 objects
 *   ... every week", attributed to the Terms of Use and dated, never more precise than the source,
 *   and leaves out "leading", which is Catawiki's self-description. It quotes "special objects
 *   that fulfil people's passions" once, in English, in the category row. The issue's other
 *   About-page figures (10+ million monthly visitors, 600+ auctions a week, 60 countries, 600+
 *   employees, auctions of 7 to 10 days) are not on the page: the About page could not be read.
 * - Role: Terms of Use, Article 4: "We're a facilitator, not a seller ... We don't own anything
 *   listed or sold on our online marketplace." Catawiki "connect[s] buyers and sellers of special
 *   objects through automated online auctions or other selling methods". The page therefore says
 *   Catawiki "runs auctions" or "offers objects in auctions", never that it "sells" (a cell that
 *   did was caught in review), and says "professional and private sellers" for who sells.
 * - Curation: Terms of Use, Article 5: "We employ in-house experts who have many years of
 *   experience in their field. They virtually review and select objects to be sold on Catawiki."
 *   The page always attributes it ("says each object ... is selected by its in-house experts",
 *   "its Terms of Use say ..."). The same Terms say in Article 14 ("The nature of an online
 *   marketplace") that "because the review process is virtual, we can't guarantee the existence,
 *   quality, safety, or legality of objects". The page does not use that sentence (it would read
 *   as a criticism, and the epic keeps speculation about a competitor's quality or safety off the
 *   pages). "Curated" in headlines and meta text is the issue's own word for Article 5's
 *   selection by experts; whether to keep it is a maintainer call (listed in the PR).
 * - Buyer protection: Buyer Terms, Article 1: "You can bid and buy safely under the Catawiki Buyer
 *   Protection. This protection makes sure all payments are safe, all objects are quality checked,
 *   and all sellers are verified." Article 3: "Our trusted payment provider holds your payment in
 *   escrow until 3 days after you've received the object." The page attributes both to the
 *   documents and says "means", not "makes sure", and drops "all" and "trusted".
 * - Fixed-price stock: Buyer Terms, Article 1: "Some objects on our online marketplace may show a
 *   buy now option. This means you can buy the object immediately without needing to participate
 *   in the auction." The issue's draft ("dealers and fixed-price → Aura Historia") therefore cannot
 *   say Catawiki lacks fixed-price stock. The page says what holds: the Catawiki cell says some
 *   objects have a buy now option, and Aura Historia's difference is that it searches the stock
 *   of dealers and shops on their own websites, which a venue does not show. Buyer Terms, Article
 *   2: "you'll enter into a contract of sale with the seller", and Articles 5 and 7 speak of
 *   "professional" and "private" sellers.
 * - Languages: Terms of Use, Article 1: "All content on our website and apps, including these
 *   Terms, was originally written in English but is available in multiple languages." The issue's
 *   "17 languages" comes from the About page, which could not be read, so the page does not use
 *   the figure; a maintainer who confirms it can add it to the `languageBreadth` row and decide
 *   whether the verdict goes to Catawiki. Until then the row is a `tie` with "No difference
 *   documented": "multiple languages" names no number, and neither readable document mentions
 *   terminology, so the terminology statements only describe Aura Historia and say that the two
 *   documents are silent. Not used: Article 14's liability list, which includes "Errors in object
 *   descriptions caused by (machine) translation"; next to Aura Historia's translated listings it
 *   would read as a contrast drawn from a limitation-of-liability clause. Never claim better or
 *   broader language support than Catawiki.
 * - Category focus: Terms of Use, Article 8: "You can filter your search with different criteria
 *   (for example category, brand, or if the object has a reserve price)". The page quotes only
 *   the self-description and the category filter, and calls Aura Historia's focus a statement of
 *   focus, not quality. The issue asks to confirm that art, antiques and design are one part of a
 *   wider range before the focus row says so: the readable documents list no categories, so the
 *   page names none and does not say Catawiki spans "every" category.
 * - Ranking and paid placement: Terms of Use, Article 8: ranking is "based on the expertise of
 *   the expert and certain other criteria including algorithms and, if available, paid
 *   advertisement", and Catawiki "use[s] personalisation". Not on the page: it is a fact about
 *   Catawiki's business and the page does not imply how results are ranked. Nothing on the page
 *   states that Aura Historia sells no placement: no maintainer has confirmed it.
 * - Monitoring: Catawiki's own help pages on follows, favourites and alerts could not be read, so
 *   no Catawiki alert feature or cadence is described, and there is no monitoring row in the
 *   scorecard (the issue lists none). The quick verdict and the advantage card claim scope only
 *   (across providers, not within one marketplace) and never that Catawiki lacks monitoring or
 *   that its alerts are slower.
 * - Aura Historia and payments: the Aura cell says Aura Historia does not sell objects or take
 *   payments "for them": the product bills subscriptions (`src/features/billing`), so a bare "takes
 *   no payments" would be wrong.
 * - Fees: left out on purpose, as the issue's default; the page makes no fee comparison and the
 *   word is on the banned list.
 * - Which auction houses Aura Historia indexes (public MCP `searchPublicListingSources`, checked
 *   2026-11-09): a search for "catawiki" returns no provider, so the page claims no overlap. It
 *   says only what the product docs support: Aura Historia indexes auction houses, dealers, shops
 *   and marketplaces. `getPublicOverview` (2026-11-09) reports 42 indexed providers, all dealers
 *   (0 auction houses, 0 marketplaces), while the provider list returns more on its first page.
 *   The two disagree, so the page keeps the wording of the maintainers' rule and the merged
 *   sibling pages; a maintainer should confirm it.
 * - Not checked, for the PR only: whether Catawiki publishes an API, an MCP server, an `llms.txt`
 *   or agent-discovery documents (403). The page says nothing about its interfaces and never says
 *   it lacks an AI-agent interface. The shared AI-assistants side-note of the issue was dropped by
 *   the maintainer in #1274, so the page has none.
 */

/** Aura Historia vs Catawiki: `/{lng}/compare/catawiki`, copy in `compareCatawikiPage.*`. */
export const CATAWIKI_COMPARISON = {
    slug: "catawiki",
    routePath: "/$lng/compare/catawiki",
    competitorName: "Catawiki",
    namespace: "compareCatawikiPage",
    metaKey: "compareCatawiki",
    lastReviewed: CATAWIKI_COMPARISON_LAST_REVIEWED,
    quickVerdicts: [
        { key: "curatedAuctions", winner: "competitor" },
        { key: "searchAcrossProviders", winner: "aura" },
        { key: "artAntiquesDesign", winner: "aura" },
        { key: "monitoring", winner: "aura" },
    ],
    advantages: [
        { key: "openMarket", icon: Layers },
        { key: "dealerStock", icon: Store },
        { key: "artAntiquesDesignFocus", icon: Frame },
        { key: "monitoringAcrossProviders", icon: Bell },
    ],
    scorecardRows: [
        { key: "curationAndProtection", winner: "competitor" },
        { key: "weeklyAuctions", winner: "competitor" },
        { key: "languageBreadth", winner: "tie" },
        { key: "sourceTypes", winner: "aura" },
        { key: "dealersAndFixedPrice", winner: "aura" },
        { key: "categoryFocus", winner: "aura" },
    ],
    sources: {
        // The same ruled list of source types as the Barnebys, Artsy, Invaluable, 1stDibs and LiveAuctioneers comparisons.
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
        { key: "dealerStock", anchor: "faq-dealer-stock" },
        { key: "languages", anchor: "faq-languages" },
    ],
    structuredDataTopics: [
        "artSearch",
        "auctionMarketplace",
        "crossProviderSearch",
        "multilingualSearch",
        "monitoring",
    ],
    positioningKey: "compareCatawikiPage.positioning",
} as const satisfies ComparisonDefinition;
