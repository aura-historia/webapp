import { CategoryHeaderSkeleton } from "@/components/category/CategoryHeaderSkeleton.tsx";
import { ProductGridItemSkeleton } from "@/components/product/grid/ProductGridItemSkeleton.tsx";

const SKELETON_IDS = Array.from({ length: 8 }, (_, i) => `skeleton-${i}`);

export function CategoryPageSkeleton() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-8">
            <CategoryHeaderSkeleton />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {SKELETON_IDS.map((id) => (
                    <ProductGridItemSkeleton key={id} />
                ))}
            </div>
        </div>
    );
}
