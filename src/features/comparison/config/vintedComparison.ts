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
 *   below was requested at least twice in separate requests with differently worded prompts. The
 *   page cites it as "its annual results release for 2025" wherever it uses it, because scorecard
 *   cells and FAQ answers are quoted on their own, and it paraphrases and never quotes. A
 *   maintainer should re-read the passages against the release before relying on this file.
 * - Self-description: "the international C2C second-hand marketplace" (opening paragraph; the
 *   page expands C2C once as consumer-to-consumer). Vinted's mission, "make second-hand the first
 *   choice worldwide", is not on the page: it is the company's aim, not a fact about the service.
 * - Members: "members now buy and sell across a wider range of items" (after the passage on new
 *   categories). The release calls the people who buy and sell "members" throughout and never says
 *   whether they are private individuals or businesses, so the "Who sells" row states only that
 *   Vinted describes a consumer-to-consumer marketplace where members buy and sell. The page
 *   never says Vinted's sellers are private, amateur or non-professional.
 * - Categories: "Core fashion continued to strengthen with strong performance in women's and
 *   kids' clothing [...]" and "more consumer-goods categories including sports and collectables".
 *   The first request paraphrased the first sentence as "core fashion remains the base"; the
 *   check that asked for the sentence itself showed the release does not use "base", so the page
 *   says "core fashion" and attributes it. "Collectables" is the release's spelling.
 * - Shipping and payment: "Vinted Go, Vinted's in-house carrier service" (launched in Spain and
 *   Portugal during 2025), "Vinted Pay began onboarding customers onto its own wallet solution",
 *   and "Vinted provides members with access to more than 500,000 pick-up and drop-off points
 *   across Europe" (the sentence continues about out-of-home delivery uptake). The page names the
 *   two services and gives the 500,000 figure, always with the release. The release's sentences
 *   on lower payment costs are fee talk and stay out.
 * - Markets: "Vinted launched in Latvia, Estonia and Slovenia, strengthening its European
 *   presence" in 2025. Used in the languages row only to say what the release does mention.
 * - Used nowhere on the page, for the PR only: the release's figures for gross merchandise value
 *   (EUR 10.8bn), revenue and net profit, and the Vinted Go market list. Money and finances are
 *   on the rules' banned list, so there is no size comparison. The Handbook's Vinted row (Market
 *   and research, "Competitors and comparables") adds buyer and seller charges; the page says
 *   nothing about fees on either side, and the word is on the banned list.
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
 *   "vinted" returns no provider, and `getPublicOverview` reports 886 indexed providers, all
 *   dealers (0 auction houses, 0 auction platforms, 0 marketplaces). The page therefore claims no
 *   overlap, says nothing about Vinted listings in Aura Historia and never says Vinted will be
 *   indexed: per the Handbook (Decisions, 24 Nov 2026) a marketplace is added only as linked
 *   inventory, through an API, a feed or an affiliate programme, and only if its terms allow
 *   Aura Historia's display and alerts.
 * - The cross-language test (research item) ran on the Aura Historia side only, because Vinted's
 *   search pages are off limits to automated requests. The page states the claim as what a search
 *   can do ("can return objects catalogued in another"), keeps it out of the quick verdicts and
 *   rates the languages row a `tie` with "No difference documented".
 *
 * AURA HISTORIA (the "Aura Historia Handbook", the maintainers' source of truth for strategy,
 * read 2026-11-26; the page follows it where it differs from older sibling pages)
 *
 * - Scope (Overview, "At a glance"; Strategy and roadmap, "Scope"): "Secondary market: antiques,
 *   historic art, decorative arts, antiquarian books, coins, stamps and militaria; designer
 *   vintage through partners for now. No contemporary primary-market art." The scope list of the
 *   `sources` chapter takes the "In" rows the live index shows: antiques and decorative arts,
 *   historic art, rare and antiquarian books with manuscripts, maps and prints, and coins, stamps
 *   and militaria (public MCP, 2026-11-26: militaria from CA-Collecting and more, first editions
 *   and antiquarian-fair catalogues from antiquarian booksellers). It leaves out the rest on
 *   purpose: designer vintage (partners only, and the Handbook's index figures list 0 partners;
 *   the page uses the word "vintage" nowhere), reproductions (hidden by default), archaeological
 *   and ethnographic objects, CITES materials and contemporary primary-market art (none of them
 *   something a comparison with Vinted needs). "Historic art" is named without the Handbook's
 *   "old masters, 19th and early 20th century", which the index does not show by itself.
 * - Providers: "A source is admitted if it is a professional seller of secondary-market objects
 *   with visible prices and its own photos" (Strategy and roadmap, "Scope"). Hence "dealers and
 *   shops, each on its own website", and "does not host listings from individuals". The older
 *   sibling pages list auction houses, auction platforms, private sellers and marketplaces among
 *   Aura Historia's provider types; the live index has none of the first, second and fourth, and
 *   the Handbook rules out open classifieds ("Heirs come in as consignment leads and matched
 *   listings, not open classifieds"), so this page does not repeat that list. Its `sources`
 *   chapter uses the slot for the scope instead (the art price databases page departs from the
 *   ruled list the same way). A maintainer should align the sibling pages.
 * - Transactions: Buy on Aura and the heirs' offers are Stage 3 and not live. The page says
 *   Aura Historia does not sell objects or take payments "for them" (the product bills
 *   subscriptions, so a bare "takes no payments" would be wrong), that the provider ships and
 *   takes payment, and that it does not host listings from individuals.
 * - The live index also holds everyday items from dealers (for example T-shirts, public MCP,
 *   2026-11-26), so the page speaks of a focus and of what Aura Historia is built for, and never
 *   says the index holds no clothing or everyday goods.
 * - Index counts (live objects, providers) are not on the page: they do not measure what Vinted's
 *   members or listings do, and the Handbook's figures (22 Nov 2026) and the live ones (26 Nov
 *   2026) already differ.
 * - Fees: left out on purpose; the page makes no fee comparison and the word is on the banned
 *   list.
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
        { key: "dealerStock", winner: "aura" },
        { key: "monitoring", winner: "aura" },
    ],
    advantages: [
        { key: "specialisedIndex", icon: Frame },
        { key: "dealersOwnWebsites", icon: Store },
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
    // The Handbook's scope, not the ruled list of source types of the auction and marketplace pages.
    sources: {
        sourceKeys: [
            "antiquesDecorativeArts",
            "historicArt",
            "rareAndAntiquarianBooks",
            "coinsStampsMilitaria",
        ],
        cards: [
            { key: "listedByDealers", icon: Network },
            { key: "askingPricesSideBySide", icon: Layers },
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
        "dealerSearch",
        "multilingualSearch",
        "monitoring",
    ],
    positioningKey: "compareVintedPage.positioning",
} as const satisfies ComparisonDefinition;
