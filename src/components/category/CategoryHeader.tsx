import { H1 } from "@/components/typography/H1.tsx";
import type { CategoryDetail } from "@/data/internal/category/CategoryDetail.ts";
import { getCategoryAssetUrl } from "@/components/landing-page/categories-section/CategoriesSection.data.ts";
import { ImageWithFallback } from "@/components/ui/image-with-fallback.tsx";

type CategoryHeaderProps = {
    readonly category: CategoryDetail;
};

export function CategoryHeader({ category }: CategoryHeaderProps) {
    const categoryAssetUrl = getCategoryAssetUrl(category.categoryKey);

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
                <ImageWithFallback
                    src={categoryAssetUrl}
                    alt=""
                    className="h-16 w-16"
                    loading="lazy"
                />
                <H1>{category.name}</H1>
            </div>
            <p className="text-base text-muted-foreground">{/* TODO: Add description */}</p>
        </div>
    );
}
