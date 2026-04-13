import { Card } from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";

export function ProductSimilarCardSkeleton() {
    return (
        <Card className="h-full min-w-0 overflow-hidden border-0 bg-card p-0 shadow-none">
            <div className="flex h-full gap-4 p-4">
                <Skeleton className="size-24 shrink-0 rounded-none" />
                <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-5 w-24 rounded-full" />
                    </div>
                    <Skeleton className="h-5 w-20" />
                </div>
            </div>
        </Card>
    );
}
