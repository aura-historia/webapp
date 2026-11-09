import { ARTSY_COMPARISON } from "@/features/comparison/config/artsyComparison.ts";
import { BARNEBYS_COMPARISON } from "@/features/comparison/config/barnebysComparison.ts";
import { CATAWIKI_COMPARISON } from "@/features/comparison/config/catawikiComparison.ts";
import type { ComparisonDefinition } from "@/features/comparison/config/comparisonDefinition.ts";
import { EBAY_COMPARISON } from "@/features/comparison/config/ebayComparison.ts";
import { FIRST_DIBS_COMPARISON } from "@/features/comparison/config/firstDibsComparison.ts";
import { INVALUABLE_COMPARISON } from "@/features/comparison/config/invaluableComparison.ts";
import { LIVE_AUCTIONEERS_COMPARISON } from "@/features/comparison/config/liveAuctioneersComparison.ts";

/**
 * Every published comparison page. The "Other comparisons" block on each page links to the others
 * from this list, so a new page is one line here and no edit to existing pages.
 */
export const COMPARISON_REGISTRY: readonly ComparisonDefinition[] = [
    BARNEBYS_COMPARISON,
    ARTSY_COMPARISON,
    INVALUABLE_COMPARISON,
    FIRST_DIBS_COMPARISON,
    LIVE_AUCTIONEERS_COMPARISON,
    CATAWIKI_COMPARISON,
    EBAY_COMPARISON,
];
