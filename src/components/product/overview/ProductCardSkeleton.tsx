import { Skeleton } from "@/components/ui/skeleton.tsx";

export function ProductCardSkeleton() {
    return (
        <div
            data-testid="product-card-skeleton"
            className={
                "w-full min-w-0 overflow-hidden border border-outline-variant/20 bg-surface-container-lowest shadow-[0_12px_40px_rgba(28,28,22,0.06)]"
            }
        >
            <Skeleton className="aspect-[4/3] w-full" />

            <div className="flex min-w-0 flex-col p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-5 w-11/12" />
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <Skeleton className="h-9 w-9 rounded-full" />
                    </div>
                </div>

                <div className="mb-3 flex items-center gap-2">
                    <Skeleton className="h-5 w-24 rounded-none" />
                    <Skeleton className="h-3 w-2" />
                    <Skeleton className="h-5 w-20 rounded-none" />
                </div>

                <div className="mb-3 flex flex-wrap gap-2">
                    <Skeleton className="h-5 w-24 rounded-none" />
                    <Skeleton className="h-5 w-28 rounded-none" />
                    <Skeleton className="h-5 w-20 rounded-none" />
                </div>

                <div className="mt-5 flex flex-col justify-end gap-3">
                    <Skeleton className="h-8 w-32" />

                    <div className="grid w-full grid-cols-1 gap-2">
                        <Skeleton className="h-9 w-full rounded-none" />
                        <Skeleton className="h-9 w-full rounded-none" />
                    </div>
                </div>
            </div>
        </div>
    );
}
