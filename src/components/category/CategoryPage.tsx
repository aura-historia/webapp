import type { GetCategoryData } from "@/client";
import { CategoryProductSection } from "@/components/category/CategoryProductSection.tsx";
import { H1 } from "@/components/typography/H1.tsx";
import { useTranslation } from "react-i18next";

const BANNER_URL =
    "https://aura-historia-public.s3.eu-central-1.amazonaws.com/branding/banner_twitter_slogan.png";

type CategoryPageProps = {
    readonly category: GetCategoryData;
};

export function CategoryPage({ category }: CategoryPageProps) {
    const { t } = useTranslation();
    const categoryName = category.name.text;

    return (
        <div className="flex flex-col">
            {/* Banner */}
            <div className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden">
                <img src={BANNER_URL} alt={categoryName} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-12 max-w-7xl mx-auto w-full">
                    <H1 className="text-white text-4xl sm:text-5xl drop-shadow-lg">
                        {categoryName}
                    </H1>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-12">
                {/* Description */}
                {category.description?.text && (
                    <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
                        {category.description.text}
                    </p>
                )}

                {/* Latest Products */}
                <CategoryProductSection
                    categoryId={category.categoryId}
                    title={t("category.latestProducts")}
                    sort="created"
                    order="desc"
                />

                {/* Most Valuable */}
                <CategoryProductSection
                    categoryId={category.categoryId}
                    title={t("category.mostExpensive")}
                    sort="price"
                    order="desc"
                />
            </div>
        </div>
    );
}
