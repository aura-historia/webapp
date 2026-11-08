import { createFileRoute } from "@tanstack/react-router";

import { INVALUABLE_COMPARISON } from "@/features/comparison/config/invaluableComparison.ts";
import { buildComparisonHead } from "@/features/comparison/lib/comparisonHead.ts";
import { ComparisonPage } from "@/features/comparison/pages/ComparisonPage.tsx";

export const Route = createFileRoute("/$lng/compare/invaluable")({
    head: () => buildComparisonHead(INVALUABLE_COMPARISON),
    component: () => <ComparisonPage definition={INVALUABLE_COMPARISON} />,
});
