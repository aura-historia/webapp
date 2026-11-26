import { Bell, Eye, Frame, Globe, Layers, Network, Route, Store } from "lucide-react";

import type { ComparisonDefinition } from "@/features/comparison/config/comparisonDefinition.ts";
import { VINTED_COMPARISON_LAST_REVIEWED } from "@/features/comparison/config/vintedComparisonReview.ts";

/*
 * Sources for the claims (all accessed 2026-11-26). Never render these as links: calls to action
 * stay internal and the page never links to a competitor.
 *
 * VINTED
 *
 * - What could be read: Vinted Group's results release for 2025, published 9 April 2026 (dateline
 *   Vilnius), "Vinted grew GMV by 47% YoY to €10.8bn, ..." on its newsroom
 *   https://company.vinted.com/newsroom/financial-results-2025
 *   company.vinted.com has no robots.txt (404), so the release was read through the harness's
 *   fetch tool, which returns a model's summary of the page and cuts quotes short. Every passage
 *   below was requested at least twice in separate requests with differently worded prompts, and
 *   an independent review repeated them. The page cites it as "its annual results release for
 *   2025" wherever it uses it, because scorecard cells and FAQ answers are quoted on their own,
 *   starts every scorecard cell with it, and paraphrases and never quotes. A maintainer should
 *   re-read the passages against the release before relying on this file.
 * - Self-description: "the international C2C second-hand marketplace" (opening paragraph). The
 *   release never expands "C2C" and never says who its sellers are, so the page uses Vinted's own
 *   abbreviation and adds no expansion inside a sentence attributed to the release (a French "de
 *   particulier à particulier" would claim who sells). Vinted's mission, "make second-hand the
 *   first choice worldwide", is not on the page: it is the company's aim, not a fact about the
 *   service.
 * - Members: "members now buy and sell across a wider range of items" (after the passage on new
 *   categories). The release calls the people who buy and sell "members" throughout and never says
 *   whether they are private individuals or businesses, so the "Who sells" row states only that
 *   Vinted describes members who buy and sell on its C2C marketplace. The page never says Vinted's
 *   sellers are private, amateur or non-professional, and never that Vinted itself sells or
 *   trades: its members do, on the marketplace.
 * - Categories: "Core fashion continued to strengthen with strong performance in women's and
 *   kids' clothing [...]" and "more consumer-goods categories including sports and collectables".
 *   The first request paraphrased the first sentence as "core fashion remains the base"; the
 *   check that asked for the sentence itself showed the release does not use "base", so the page
 *   says "core fashion" and attributes it. "Collectables" is the release's spelling.
 * - Shipping and payment: "Vinted Go, Vinted's in-house carrier service" (launched in Spain and
 *   Portugal during 2025), "Vinted Pay began onboarding customers onto its own wallet solution"
 *   and "Through its network of delivery partners, Vinted provides members with access to more
 *   than 500,000 pick-up and drop-off points across Europe" (the sentence goes on about out-of-home
 *   delivery uptake). The first answers called Vinted Pay a "payment service" and left out the
 *   delivery partners; the sentences themselves say "wallet solution", and that the 500,000 points
 *   come through delivery partners, not through Vinted Go, so the page says exactly that. The
 *   release's sentences on lower payment costs are fee talk and stay out.
 * - Markets: "Vinted launched in Latvia, Estonia and Slovenia, strengthening its European
 *   presence" in 2025. Used in the languages row only to say what the release does mention.
 * - Used nowhere on the page, for the PR only: the release's figures for gross merchandise value
 *   (EUR 10.8bn), revenue and net profit, and the Vinted Go market list. Money and finances are
 *   on the rules' banned list, so there is no size comparison, and the page says nothing about
 *   fees on either side (the word is on the banned list too).
 * - Not used: Vinted's own marketplace and help pages. The robots.txt of www.vinted.com
 *   (no version or date, read 2026-11-26) disallows ClaudeBot, GPTBot, Google-Extended, Amazonbot
 *   and CCBot from the whole site (`Content-Signal: ai-train=no, search=yes, ai-input=no`) and
 *   states `ai-train=no, search=yes, ai-input=yes` for other agents. The fetch tool does not say
 *   which of those groups it falls under, so no other www.vinted.com URL was requested. Nothing
 *   from its help centre on buyer protection, shipping rules, saved searches or alerts is on the
 *   page. A maintainer should read those pages in a browser before the page says more. There is
 *   no buyer-protection row and no monitoring row in the scorecard for that reason, and nothing on
 *   the page describes Vinted's buyer protection, saved searches or alerts. The quick verdict
 *   "monitoring across providers" rests on scope alone (one service that follows objects across
 *   providers, as the product does), never on how Vinted's own alerts work.
 * - Is Vinted indexed as a provider (public MCP, 2026-11-26): `searchPublicListingSources` for
 *   "vinted" returns no provider. The page therefore claims no overlap, says nothing about Vinted
 *   listings in Aura Historia and never says Vinted will be indexed.
 * - The cross-language test (research item) ran on the Aura Historia side only, because Vinted's
 *   search pages are off limits to automated requests. The page states the claim as what a search
 *   can do ("can return objects catalogued in another"), keeps it out of the quick verdicts and
 *   rates the languages row a `tie` with "No difference documented".
 *
 * AURA HISTORIA (checked through the public MCP on 2026-11-26)
 *
 * - Providers: the page names dealers, shops, auction houses and marketplaces as Aura Historia's
 *   providers, as the sibling pages do and as the maintainer confirmed on 2026-11-26 (the same
 *   wording as the eBay page, key for key). `getPublicOverview` (public MCP, 2026-11-26) lists
 *   dealers only, so a maintainer should re-check this wording against the index at the next
 *   review. The page names no auction platforms and no private sellers (the sibling pages' ruled
 *   list has both) and says Aura Historia hosts no listings from private individuals. Some
 *   dealers' listings sit on a marketplace storefront (an antiquarian bookseller's listing on
 *   zvab.com), so the page says providers "publish online" and never "on their own websites";
 *   "Go to provider" opens the listing on the provider's own page, as on the sibling pages.
 * - Focus: the `sources` chapter names the main areas the index shows (militaria from a dealer;
 *   first editions and antiquarian-fair catalogues from antiquarian booksellers): antiques and
 *   decorative arts, historic art, rare and antiquarian books with manuscripts, maps and prints,
 *   and coins, stamps and militaria. It is a list of focus, not a complete list: the index is
 *   gated on source and object quality, not on category, so the chapter is titled "Where Aura
 *   Historia focuses" and never calls the scope narrow or exhaustive. The page names no designer
 *   vintage (the word "vintage" appears nowhere) and no segment the index does not cover broadly
 *   yet. "Historic art" is named without a period or style, which the index does not show by
 *   itself. The scorecard cell on category focus says "art and antiques" before the list, because
 *   none of the listed areas is design.
 * - The live index also holds everyday items from dealers (for example T-shirts), so the page
 *   speaks of a focus and of what Aura Historia is built for, and never says the index holds no
 *   clothing or everyday goods.
 * - Transactions: the page says Aura Historia does not sell objects or take payments "for them"
 *   (the product bills subscriptions, so a bare "takes no payments" would be wrong), and that the
 *   provider ships and takes payment under its own terms.
 * - Index counts (live objects, providers) are not on the page: they change from day to day and
 *   do not measure what Vinted's members or listings do.
 */

/** Aura Historia vs Vinted: `/{lng}/compare/vinted`, copy in `compareVintedPage.*`. */
export const VINTED_COMPARISON = {
    slug: "vinted",
    routePath: "/$lng/compare/vinted",
    competitorName: "Vinted",
    namespace: "compareVintedPage",
    metaKey: "compareVinted",
    lastReviewed: VINTED_COMPARISON_LAST_REVIEWED,
    quickVerdicts: [
        { key: "secondHandTrading", winner: "competitor" },
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
        { key: "marketplaceModel", winner: "competitor" },
        { key: "shippingAndPayment", winner: "competitor" },
        { key: "categoryFocus", winner: "aura" },
        { key: "providerTypes", winner: "aura" },
        { key: "languagesAndTerminology", winner: "tie" },
    ],
    // The main areas of focus, not the ruled list of source types of the auction and marketplace pages.
    sources: {
        sourceKeys: [
            "antiquesDecorativeArts",
            "historicArt",
            "rareAndAntiquarianBooks",
            "coinsStampsMilitaria",
        ],
        cards: [
            { key: "listedByProviders", icon: Network },
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
        { key: "sellOwnItems", anchor: "faq-sell-own-items" },
        { key: "everydayGoods", anchor: "faq-everyday-goods" },
        { key: "authenticity", anchor: "faq-authenticity" },
    ],
    structuredDataTopics: [
        "artSearch",
        "secondHandMarketplace",
        "crossProviderSearch",
        "multilingualSearch",
        "monitoring",
    ],
    positioningKey: "compareVintedPage.positioning",
} as const satisfies ComparisonDefinition;
