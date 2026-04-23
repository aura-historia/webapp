import { Card } from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";

export function SearchFilterCardSkeleton() {
    return (
        <Card className="flex flex-col p-6 gap-5 shadow-md min-w-0 h-full">
            <div className="flex justify-between">
                <div className="flex flex-col gap-2 overflow-hidden">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-7 w-48" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-5 w-32" />
                </div>
                <div className="flex gap-1">
                    <Skeleton className="size-10 rounded-md" />
                    <Skeleton className="size-10 rounded-md" />
                    <Skeleton className="size-10 rounded-md" />
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
            </div>
            <div className="flex gap-2 mt-auto">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 flex-1" />
            </div>
        </Card>
    );
}
