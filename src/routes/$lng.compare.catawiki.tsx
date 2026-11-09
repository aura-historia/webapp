import { createFileRoute } from "@tanstack/react-router";

import { CATAWIKI_COMPARISON } from "@/features/comparison/config/catawikiComparison.ts";
import { buildComparisonHead } from "@/features/comparison/lib/comparisonHead.ts";
import { ComparisonPage } from "@/features/comparison/pages/ComparisonPage.tsx";

export const Route = createFileRoute("/$lng/compare/catawiki")({
    head: () => buildComparisonHead(CATAWIKI_COMPARISON),
    component: () => <ComparisonPage definition={CATAWIKI_COMPARISON} />,
});
