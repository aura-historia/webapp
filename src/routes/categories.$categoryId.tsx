import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getCategoryByIdOptions } from "@/client/@tanstack/react-query.gen";
import { mapToCategoryDetail } from "@/data/internal/category/CategoryDetail.ts";
import { generateCategoryHeadMeta } from "@/lib/categoryHeadMeta.ts";
import { NotFoundComponent } from "@/components/common/NotFoundComponent.tsx";
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

    // Content intentionally left empty — mapping is wired up and ready.
    void mapToCategoryDetail(data);

    return <div />;
}
