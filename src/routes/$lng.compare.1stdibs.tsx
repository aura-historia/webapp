import { createFileRoute } from "@tanstack/react-router";

import { FIRST_DIBS_COMPARISON } from "@/features/comparison/config/firstDibsComparison.ts";
import { buildComparisonHead } from "@/features/comparison/lib/comparisonHead.ts";
import { ComparisonPage } from "@/features/comparison/pages/ComparisonPage.tsx";

export const Route = createFileRoute("/$lng/compare/1stdibs")({
    head: () => buildComparisonHead(FIRST_DIBS_COMPARISON),
    component: () => <ComparisonPage definition={FIRST_DIBS_COMPARISON} />,
});
