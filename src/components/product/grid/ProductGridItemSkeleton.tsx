import { Card } from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";

export function ProductGridItemSkeleton() {
    return (
        <Card
            data-testid="product-grid-item-skeleton"
            className="flex flex-col h-full p-0 shadow-md overflow-hidden min-w-0"
        >
            <Skeleton className="w-full aspect-4/3 rounded-none" />
            <div className="flex flex-col min-w-0 flex-1 justify-between p-4 gap-3">
                <div className="flex flex-col gap-1.5 min-w-0 overflow-hidden">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-9 w-full" />
            </div>
        </Card>
    );
}
