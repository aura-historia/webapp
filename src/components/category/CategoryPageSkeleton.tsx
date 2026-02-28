import { Skeleton } from "@/components/ui/skeleton.tsx";
import { CategoryProductCardSkeleton } from "@/components/category/CategoryProductCardSkeleton.tsx";

const SKELETON_COUNT = 8;

export function CategoryPageSkeleton() {
    return (
        <div className="flex flex-col">
            {/* Banner skeleton */}
            <Skeleton className="w-full h-48 sm:h-64 md:h-80 rounded-none" />

            {/* Content skeleton */}
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-12">
                {/* Description skeleton */}
                <div className="flex flex-col gap-2 max-w-3xl">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-3/4" />
                </div>

                {/* Section skeleton */}
                <div>
                    <Skeleton className="h-8 w-48 mb-6" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {Array.from({ length: SKELETON_COUNT }, (_, i) => `skeleton-${i}`).map(
                            (id) => (
                                <CategoryProductCardSkeleton key={id} />
                            ),
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
