import { Card } from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";

export function NotificationCardSkeleton() {
    return (
        <Card className="flex flex-col lg:flex-row p-8 gap-4 shadow-md min-w-0">
            <div className="shrink-0 flex lg:justify-start justify-center">
                <Skeleton className="size-48" />
            </div>
            <div className="flex flex-col min-w-0 flex-1 justify-between">
                <div className="flex flex-col gap-2 overflow-hidden">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-6 w-40" />
                </div>
                <div className="flex justify-between items-end mt-4 lg:mt-0">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                </div>
            </div>
        </Card>
    );
}
