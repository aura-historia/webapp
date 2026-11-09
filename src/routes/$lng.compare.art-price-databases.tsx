import { createFileRoute } from "@tanstack/react-router";

import { ART_PRICE_DATABASES_COMPARISON } from "@/features/comparison/config/artPriceDatabasesComparison.ts";
import { buildComparisonHead } from "@/features/comparison/lib/comparisonHead.ts";
import { ComparisonPage } from "@/features/comparison/pages/ComparisonPage.tsx";

export const Route = createFileRoute("/$lng/compare/art-price-databases")({
    head: () => buildComparisonHead(ART_PRICE_DATABASES_COMPARISON),
    component: () => <ComparisonPage definition={ART_PRICE_DATABASES_COMPARISON} />,
});
