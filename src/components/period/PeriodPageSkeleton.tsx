import { Skeleton } from "@/components/ui/skeleton.tsx";
import { ProductCardSkeleton } from "@/components/product/overview/ProductCardSkeleton.tsx";

const SKELETON_IDS = ["skeleton-1", "skeleton-2", "skeleton-3"] as const;

export function PeriodPageSkeleton() {
    return (
        <div className="max-w-6xl mx-auto flex flex-col gap-6 pt-6 pb-12 px-4 sm:px-8 lg:px-0">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-48 sm:h-64 md:h-72 w-full rounded-xl" />
            <Skeleton className="h-6 w-3/4 max-w-3xl" />
            <Skeleton className="h-6 w-1/2 max-w-3xl" />

            <div className="flex flex-col gap-12 mt-4">
                <div className="flex flex-col gap-4">
                    <Skeleton className="h-8 w-48" />
                    {SKELETON_IDS.map((id) => (
                        <ProductCardSkeleton key={id} />
                    ))}
                </div>
            </div>
        </div>
    );
}
