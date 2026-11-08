import type { LucideIcon } from "lucide-react";

import type { FileRoutesByTo } from "@/routeTree.gen.ts";
import type { PageMetaKey } from "@/lib/seo/pageHeadMeta.ts";

/**
 * Which service a verdict favours: Aura Historia's carry the oxblood mark, the competitor's stay
 * outlined, and a tie (both offer the same thing) is a neutral outline.
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
    /** The competitor's name as it is written; never translated. */
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
     * about the competitor's current state (for example insolvency or a change of operator).
     */
    readonly statusNote?: boolean;
    readonly quickVerdicts: readonly ComparisonVerdictItem[];
    /** The "advantages" chapter cards: `<namespace>.advantages.cards.<key>`. */
    readonly advantages: readonly ComparisonCardItem[];
    /** Scorecard rows: `<namespace>.scorecard.rows.<key>.{criterion,competitor,auraHistoria,verdict}`. */
    readonly scorecardRows: readonly ComparisonVerdictItem[];
    /** Optional "source types" chapter (`#sources`), copy at `<namespace>.downstream.*`. */
    readonly sources?: {
        readonly sourceKeys: readonly string[];
        readonly cards: readonly ComparisonCardItem[];
    };
    /** Optional single-column chapter (`#alerts`), copy at `<namespace>.alerts.*`. */
    readonly alerts?: {
        readonly icon: LucideIcon;
    };
    /** Page-specific FAQ items; the shared AI-assistants item is appended to every page. */
    readonly faqItems: readonly ComparisonFaqItemDefinition[];
    /** Article `about` topics: `<namespace>.structuredData.about.<topic>`. */
    readonly structuredDataTopics: readonly string[];
    /** One neutral line for the "Other comparisons" block on the other pages. */
    readonly positioningKey: string;
}

/** Every chapter id in page order. `sources` and `alerts` appear only when the definition has them. */
export const COMPARISON_CHAPTER_IDS = [
    "summary",
    "respect",
    "advantages",
    "scorecard",
    "sources",
    "alerts",
    "faq",
    "verdict",
] as const;

export type ComparisonChapterId = (typeof COMPARISON_CHAPTER_IDS)[number];

/** The AI-assistants side-note band under the hero, on every comparison page. */
export const COMPARISON_AGENTS_SECTION_ID = "agents";

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
        return true;
    });
}

/**
 * The "On this page" links, derived from the definition: the side-note first, then every chapter
 * in page order with its numeral (the closing verdict gets an arrow).
 */
export function getComparisonNav(definition: ComparisonDefinition): readonly ComparisonNavItem[] {
    const chapters = getComparisonChapters(definition);
    const chapterItems = chapters.flatMap((id, index): ComparisonNavItem[] => {
        if (CHAPTERS_OUTSIDE_NAV.has(id)) return [];
        return [
            {
                id,
                labelKey: `${definition.namespace}.nav.items.${id}`,
                marker: id === "verdict" ? "→" : (ROMAN_NUMERALS[index] ?? String(index + 1)),
            },
        ];
    });

    return [
        {
            id: COMPARISON_AGENTS_SECTION_ID,
            labelKey: "comparison.nav.agents",
            marker: "MCP",
        },
        ...chapterItems,
    ];
}

export interface ComparisonFaqEntry {
    readonly anchor: string;
    readonly questionKey: string;
    readonly answerKey: string;
}

/** The shared FAQ item every comparison page ends with. */
export const COMPARISON_AI_ASSISTANTS_FAQ: ComparisonFaqEntry = {
    anchor: "faq-ai-assistants",
    questionKey: "comparison.faq.aiAssistants.question",
    answerKey: "comparison.faq.aiAssistants.answer",
};

/** The visible FAQ, in order: the page's own items, then the shared AI-assistants item. */
export function getComparisonFaq(definition: ComparisonDefinition): readonly ComparisonFaqEntry[] {
    return [
        ...definition.faqItems.map((item) => ({
            anchor: item.anchor,
            questionKey: `${definition.namespace}.faq.items.${item.key}.question`,
            answerKey: `${definition.namespace}.faq.items.${item.key}.answer`,
        })),
        COMPARISON_AI_ASSISTANTS_FAQ,
    ];
}
