import { Card } from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";

export function ProductGridItemSkeleton() {
    return (
        <Card
            data-testid="product-grid-item-skeleton"
            className="flex h-full w-full min-w-0 flex-col gap-3 border-0 bg-transparent p-0 shadow-none"
        >
            <Skeleton className="aspect-4/5 w-full rounded-none" />

            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-start justify-between gap-3">
                    <Skeleton className="h-3 w-1/3 rounded-none" />
                    <Skeleton className="h-7 w-1/4 rounded-none" />
                </div>
                <Skeleton className="h-8 w-full rounded-none" />
                <Skeleton className="h-8 w-4/5 rounded-none" />
                <Skeleton className="h-4 w-1/2 rounded-none" />
            </div>
        </Card>
    );
}
