import { Skeleton } from "@/components/ui/skeleton.tsx";

export function ShopCardSkeleton() {
    return (
        <div
            data-testid="shop-card-skeleton"
            className={
                "w-full min-w-0 overflow-hidden border border-outline-variant/20 bg-surface-container-lowest shadow-[0_12px_40px_rgba(28,28,22,0.06)]"
            }
        >
            <Skeleton className="aspect-square w-full" />

            <div className="flex min-w-0 flex-col gap-3 p-5">
                <div className="space-y-2">
                    <Skeleton className="h-7 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-5 w-24 rounded-none" />
                    <Skeleton className="h-5 w-28 rounded-none" />
                </div>
                <Skeleton className="h-10 w-full rounded-none" />
            </div>
        </div>
    );
}
