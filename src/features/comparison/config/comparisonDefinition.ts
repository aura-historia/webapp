import type { LucideIcon } from "lucide-react";

import type { FileRoutesByTo } from "@/routeTree.gen.ts";
import type { PageMetaKey } from "@/lib/seo/pageHeadMeta.ts";

/**
 * Which service a verdict favours: Aura Historia's carry the oxblood mark, the competitor's stay
 * outlined, and a tie (both offer the same thing, or the two are complementary rather than rivals)
 * is a neutral outline.
 */
export type ComparisonWinner = "aura" | "competitor" | "tie";

/** A comparison page's route: one thin `$lng.compare.<slug>.tsx` file per competitor. */
export type ComparisonRoutePath = Extract<keyof FileRoutesByTo, `/$lng/compare/${string}`>;

/** A row of the quick answer or the scorecard: copy at `<namespace>.<group>.<key>.*`. */
export interface ComparisonVerdictItem {
    readonly key: string;
    readonly winner: ComparisonWinner;
}

/** A numbered card with an icon: copy at `<namespace>.<group>.cards.<key>.{title,description}`. */
export interface ComparisonCardItem {
    readonly key: string;
    readonly icon: LucideIcon;
}

/** A page-specific FAQ item: copy at `<namespace>.faq.items.<key>.*`, addressed as `#<anchor>`. */
export interface ComparisonFaqItemDefinition {
    readonly key: string;
    readonly anchor: string;
}

/**
 * Everything one comparison page needs besides its copy. Copy lives in the page's own namespace
 * (`compare<Name>Page.*`); strings every comparison shares live in `comparison.*`.
 */
export interface ComparisonDefinition {
    /** URL segment below `/compare/`, e.g. `barnebys`. */
    readonly slug: string;
    readonly routePath: ComparisonRoutePath;
    /**
     * The competitor's name as it is written; never translated. For a category of tool rather than
     * one product, list the brand names (the footer and the cross-link block print it after
     * "Aura Historia vs"); the category itself is named in the page's copy.
     */
    readonly competitorName: string;
    /** The page's translation namespace, e.g. `compareBarnebysPage`. */
    readonly namespace: string;
    /** Title and description at `meta.<metaKey>.*`. */
    readonly metaKey: PageMetaKey;
    /**
     * The day the page's claims were last checked (ISO `YYYY-MM-DD`). Keep it in its own file and
     * change it only after re-checking; never derive it from the clock or the build.
     */
    readonly lastReviewed: string;
    /**
     * Shows `<namespace>.respect.status` under the respect chapter: one dated, factual sentence
     * about the competitor's situation, as far as a primary source supports it (for example an
     * insolvency, a change of operator or a combination with another company).
     */
    readonly statusNote?: boolean;
    readonly quickVerdicts: readonly ComparisonVerdictItem[];
    /** The "advantages" chapter cards: `<namespace>.advantages.cards.<key>`. */
    readonly advantages: readonly ComparisonCardItem[];
    /** Scorecard rows: `<namespace>.scorecard.rows.<key>.{criterion,competitor,auraHistoria,verdict}`. */
    readonly scorecardRows: readonly ComparisonVerdictItem[];
    /**
     * Optional "source types" chapter (`#sources`), copy at `<namespace>.downstream.*`. A page may
     * fill the slot with another short list and four cards under its own chapter title (the art
     * price databases page: the questions each tool answers).
     */
    readonly sources?: {
        readonly sourceKeys: readonly string[];
        readonly cards: readonly ComparisonCardItem[];
    };
    /** Optional single-column chapter (`#alerts`), copy at `<namespace>.alerts.*`. */
    readonly alerts?: {
        readonly icon: LucideIcon;
    };
    /**
     * Optional single-column chapter (`#together`), copy at `<namespace>.together.*`: how the
     * competitor and Aura Historia fit together, for a competitor a reader may use alongside the
     * search (for example a venue for bidding). It uses the layout of the `alerts` chapter and
     * follows it when a page has both.
     */
    readonly together?: {
        readonly icon: LucideIcon;
    };
    /** FAQ items in page order. */
    readonly faqItems: readonly ComparisonFaqItemDefinition[];
    /** Article `about` topics: `<namespace>.structuredData.about.<topic>`. */
    readonly structuredDataTopics: readonly string[];
    /** One neutral line for the "Other comparisons" block on the other pages. */
    readonly positioningKey: string;
}

/**
 * Every chapter id in page order. `sources`, `alerts` and `together` appear only when the
 * definition has them.
 */
export const COMPARISON_CHAPTER_IDS = [
    "summary",
    "respect",
    "advantages",
    "scorecard",
    "sources",
    "alerts",
    "together",
    "faq",
    "verdict",
] as const;

export type ComparisonChapterId = (typeof COMPARISON_CHAPTER_IDS)[number];

/** Chapters the "On this page" bar leaves out (the respect chapter sits between I and III). */
const CHAPTERS_OUTSIDE_NAV: ReadonlySet<ComparisonChapterId> = new Set(["respect"]);

const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

export interface ComparisonNavItem {
    readonly id: string;
    /** Translation key of the link label. */
    readonly labelKey: string;
    /** The chapter numeral the phone list shows beside the link. */
    readonly marker: string;
}

/** The chapters a definition renders, in page order. */
export function getComparisonChapters(
    definition: ComparisonDefinition,
): readonly ComparisonChapterId[] {
    return COMPARISON_CHAPTER_IDS.filter((id) => {
        if (id === "sources") return definition.sources !== undefined;
        if (id === "alerts") return definition.alerts !== undefined;
        if (id === "together") return definition.together !== undefined;
        return true;
    });
}

/**
 * The "On this page" links, derived from the definition: every chapter in page order with its
 * numeral (the closing verdict gets an arrow).
 */
export function getComparisonNav(definition: ComparisonDefinition): readonly ComparisonNavItem[] {
    const chapters = getComparisonChapters(definition);
    return chapters.flatMap((id, index): ComparisonNavItem[] => {
        if (CHAPTERS_OUTSIDE_NAV.has(id)) return [];
        return [
            {
                id,
                labelKey: `${definition.namespace}.nav.items.${id}`,
                marker: id === "verdict" ? "→" : (ROMAN_NUMERALS[index] ?? String(index + 1)),
            },
        ];
    });
}

export interface ComparisonFaqEntry {
    readonly anchor: string;
    readonly questionKey: string;
    readonly answerKey: string;
}

/** The visible FAQ in page order, with the translation keys of each question and answer. */
export function getComparisonFaq(definition: ComparisonDefinition): readonly ComparisonFaqEntry[] {
    return definition.faqItems.map((item) => ({
        anchor: item.anchor,
        questionKey: `${definition.namespace}.faq.items.${item.key}.question`,
        answerKey: `${definition.namespace}.faq.items.${item.key}.answer`,
    }));
}
