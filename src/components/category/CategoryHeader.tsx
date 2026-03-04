import { H1 } from "@/components/typography/H1.tsx";
import type { CategoryDetail } from "@/data/internal/category/CategoryDetail.ts";

type CategoryHeaderProps = {
    readonly category: CategoryDetail;
};

export function CategoryHeader({ category }: CategoryHeaderProps) {
    return (
        <div className="flex flex-col gap-2">
            <H1>{category.name}</H1>
            <p className="text-base text-muted-foreground">{category.description}</p>
        </div>
    );
}
