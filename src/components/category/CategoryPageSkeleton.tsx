import { CategoryHeaderSkeleton } from "@/components/category/CategoryHeaderSkeleton.tsx";
import { ProductGridItemSkeleton } from "@/components/product/grid/ProductGridItemSkeleton.tsx";

const SKELETON_IDS = Array.from({ length: 8 }, (_, i) => `skeleton-${i}`);

export function CategoryPageSkeleton() {
    return (
        <div className="flex flex-col">
            <CategoryHeaderSkeleton />
            <div className="mx-auto w-full max-w-7xl px-4 pb-16 md:px-10">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {SKELETON_IDS.map((id) => (
                        <ProductGridItemSkeleton key={id} />
                    ))}
                </div>
            </div>
        </div>
    );
}
