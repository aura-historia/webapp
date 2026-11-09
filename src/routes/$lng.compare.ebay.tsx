import { createFileRoute } from "@tanstack/react-router";

import { EBAY_COMPARISON } from "@/features/comparison/config/ebayComparison.ts";
import { buildComparisonHead } from "@/features/comparison/lib/comparisonHead.ts";
import { ComparisonPage } from "@/features/comparison/pages/ComparisonPage.tsx";

export const Route = createFileRoute("/$lng/compare/ebay")({
    head: () => buildComparisonHead(EBAY_COMPARISON),
    component: () => <ComparisonPage definition={EBAY_COMPARISON} />,
});
