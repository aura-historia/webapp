import { H1 } from "@/components/typography/H1.tsx";
import type { CategoryDetail } from "@/data/internal/category/CategoryDetail.ts";
import { getCategoryIcon } from "@/components/landing-page/categories-section/CategoriesSection.data.ts";

type CategoryHeaderProps = {
    readonly category: CategoryDetail;
};

export function CategoryHeader({ category }: CategoryHeaderProps) {
    const IconComponent = getCategoryIcon(category.categoryKey);

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
                <IconComponent className="w-8 h-8" />
                <H1>{category.name}</H1>
            </div>
            <p className="text-base text-muted-foreground">{/* TODO: Add description */}</p>
        </div>
    );
}
