import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getCategoryByIdOptions } from "@/client/@tanstack/react-query.gen";
import { CategoryPage } from "@/components/category/CategoryPage.tsx";
import { CategoryPageSkeleton } from "@/components/category/CategoryPageSkeleton.tsx";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import i18n from "@/i18n/i18n.ts";
import { useTranslation } from "react-i18next";
import { NotFoundComponent } from "@/components/common/NotFoundComponent.tsx";

export const Route = createFileRoute("/categories/$categoryId")({
    loader: async ({ context: { queryClient }, params: { categoryId } }) => {
        return await queryClient.ensureQueryData(
            getCategoryByIdOptions({
                path: { categoryId },
                query: { language: parseLanguage(i18n.language) },
            }),
        );
    },
    head: ({ loaderData }) => {
        const name = loaderData?.name?.text ?? "";
        const description = loaderData?.description?.text ?? "";
        const title = name
            ? i18n.t("meta.category.title", { name })
            : i18n.t("common.auraHistoria");
        const metaDescription =
            description || (name ? i18n.t("meta.category.description", { name }) : undefined);
        const url = loaderData?.categoryId
            ? `https://aura-historia.com/categories/${loaderData.categoryId}`
            : undefined;

        return {
            meta: [
                { title },
                ...(metaDescription
                    ? [{ name: "description" as const, content: metaDescription }]
                    : []),
                { property: "og:title" as const, content: title },
                ...(metaDescription
                    ? [{ property: "og:description" as const, content: metaDescription }]
                    : []),
                { property: "og:type" as const, content: "website" },
                ...(url ? [{ property: "og:url" as const, content: url }] : []),
                { name: "twitter:title" as const, content: title },
                ...(metaDescription
                    ? [{ name: "twitter:description" as const, content: metaDescription }]
                    : []),
                ...(url ? [{ name: "twitter:url" as const, content: url }] : []),
            ],
            links: url ? [{ rel: "canonical", href: url }] : [],
        };
    },
    pendingComponent: CategoryPageSkeleton,
    errorComponent: NotFoundComponent,
    component: CategoryComponent,
});

function CategoryComponent() {
    const { categoryId } = Route.useParams();
    const { i18n } = useTranslation();

    const { data: category } = useSuspenseQuery(
        getCategoryByIdOptions({
            path: { categoryId },
            query: { language: parseLanguage(i18n.language) },
        }),
    );

    return <CategoryPage category={category} />;
}
