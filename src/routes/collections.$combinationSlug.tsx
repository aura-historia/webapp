import { createFileRoute, notFound } from "@tanstack/react-router";
import { getCombinationBySlug } from "@/data/combinations/combinations.ts";
import { generateCombinationHeadMeta } from "@/lib/seo/combination/combinationHeadMeta.ts";
import { NotFoundComponent } from "@/components/common/NotFoundComponent.tsx";
import { CombinationPageSkeleton } from "@/components/combination/CombinationPageSkeleton.tsx";
import { CombinationHeader } from "@/components/combination/CombinationHeader.tsx";
import { CombinationProductGrid } from "@/components/combination/CombinationProductGrid.tsx";

export const Route = createFileRoute("/collections/$combinationSlug")({
    loader: ({ params: { combinationSlug } }) => {
        const combination = getCombinationBySlug(combinationSlug);
        if (!combination) {
            throw notFound();
        }
        return combination;
    },
    head: ({ loaderData }) => generateCombinationHeadMeta(loaderData),
    pendingComponent: CombinationPageSkeleton,
    notFoundComponent: NotFoundComponent,
    errorComponent: NotFoundComponent,
    component: CombinationDetailComponent,
});

function CombinationDetailComponent() {
    const combination = Route.useLoaderData();

    return (
        <div className="bg-background">
            <CombinationHeader combination={combination} />
            <div className="mx-auto w-full max-w-7xl px-4 pb-16 md:px-10">
                <div aria-hidden="true" className="border-t border-border/30 hidden md:block" />
                <div className="pt-8">
                    <CombinationProductGrid
                        categoryId={combination.categoryId}
                        periodId={combination.periodId}
                    />
                </div>
            </div>
        </div>
    );
}
