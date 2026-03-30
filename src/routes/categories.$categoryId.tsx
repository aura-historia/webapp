import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getCategoryByIdOptions } from "@/client/@tanstack/react-query.gen";
import { mapToCategoryDetail } from "@/data/internal/category/CategoryDetail.ts";
import { generateCategoryHeadMeta } from "@/lib/seo/categoryHeadMeta.ts";
import { NotFoundComponent } from "@/components/common/NotFoundComponent.tsx";
import { CategoryPageSkeleton } from "@/components/category/CategoryPageSkeleton.tsx";
import { CategoryHeader } from "@/components/category/CategoryHeader.tsx";
import { CategoryProductGrid } from "@/components/category/CategoryProductGrid.tsx";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import i18n from "@/i18n/i18n.ts";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/categories/$categoryId")({
    loader: async ({ context: { queryClient }, params: { categoryId } }) => {
        return await queryClient.ensureQueryData(
            getCategoryByIdOptions({
                path: { categoryId },
                query: { language: parseLanguage(i18n.language) },
            }),
        );
    },
    head: ({ loaderData, params }) => generateCategoryHeadMeta(loaderData, params),
    pendingComponent: CategoryPageSkeleton,
    errorComponent: NotFoundComponent,
    component: CategoryDetailComponent,
});

function CategoryDetailComponent() {
    const { categoryId } = Route.useParams();
    const { i18n: i18nInstance } = useTranslation();

    const { data } = useSuspenseQuery(
        getCategoryByIdOptions({
            path: { categoryId },
            query: { language: parseLanguage(i18nInstance.language) },
        }),
    );

    const category = mapToCategoryDetail(data);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-8">
            <CategoryHeader category={category} />
            <CategoryProductGrid categoryId={categoryId} />
        </div>
    );
}
