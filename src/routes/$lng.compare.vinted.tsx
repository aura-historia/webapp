import { createFileRoute } from "@tanstack/react-router";

import { VINTED_COMPARISON } from "@/features/comparison/config/vintedComparison.ts";
import { buildComparisonHead } from "@/features/comparison/lib/comparisonHead.ts";
import { ComparisonPage } from "@/features/comparison/pages/ComparisonPage.tsx";

export const Route = createFileRoute("/$lng/compare/vinted")({
    head: () => buildComparisonHead(VINTED_COMPARISON),
    component: () => <ComparisonPage definition={VINTED_COMPARISON} />,
});
