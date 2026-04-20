import { Card } from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";

export function ProductSimilarCardSkeleton() {
    return (
        <Card className="h-full min-w-0 overflow-hidden border-0 bg-card p-0 shadow-none">
            <div className="flex h-full gap-4 p-2">
                <div className="size-24 shrink-0 overflow-hidden bg-background">
                    <Skeleton className="size-full rounded-none" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex gap-2">
                            <Skeleton className="h-5 w-24 rounded-none" />
                            <Skeleton className="h-5 w-20 rounded-none" />
                        </div>
                        <Skeleton className="h-5 w-20" />
                    </div>
                </div>
            </div>
        </Card>
    );
}
