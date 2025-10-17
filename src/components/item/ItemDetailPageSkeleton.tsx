import { Card } from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";

export function ItemDetailPageSkeleton() {
    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* ItemInfo Skeleton */}
            <Card className="flex flex-col sm:flex-row p-8 gap-4 shadow-md min-w-0">
                {/* Image Skeleton */}
                <div className="flex-shrink-0 flex sm:justify-start justify-center">
                    <div className="w-full sm:w-48 md:w-80 lg:w-96 space-y-3">
                        <Skeleton className="w-full h-64 sm:h-48 md:h-80 lg:h-96 rounded-lg" />
                        <div className="flex gap-2 justify-center">
                            <Skeleton className="w-24 h-24 rounded-md" />
                            <Skeleton className="w-24 h-24 rounded-md" />
                            <Skeleton className="w-24 h-24 rounded-md" />
                        </div>
                    </div>
                </div>

                {/* Content Skeleton */}
                <div className="flex flex-col min-w-0 flex-1 gap-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-6 w-24 rounded-full" />

                    <div className="flex-1" />

                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between sm:items-end">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-48" />
                    </div>
                </div>
            </Card>

            {/* Chart + History Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr] gap-4 sm:gap-6 lg:gap-8 mt-6 md:mt-8 md:grid-rows-[575px] lg:grid-rows-[575px] xl:grid-rows-[550px]">
                {/* Chart Skeleton */}
                <Card className="flex flex-col p-8 gap-4 shadow-md min-w-0 h-full">
                    <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center md:items-start lg:items-center sm:justify-between lg:justify-between gap-4">
                        <Skeleton className="h-8 w-40" />
                        <div className="flex gap-2 flex-wrap">
                            <Skeleton className="h-8 w-12" />
                            <Skeleton className="h-8 w-12" />
                            <Skeleton className="h-8 w-12" />
                            <Skeleton className="h-8 w-12" />
                            <Skeleton className="h-8 w-12" />
                            <Skeleton className="h-8 w-12" />
                            <Skeleton className="h-8 w-16" />
                        </div>
                    </div>
                    <Skeleton className="flex-1 min-h-[300px] rounded-lg" />
                </Card>

                {/* History Skeleton */}
                <Card className="flex flex-col p-8 gap-4 shadow-md min-w-0 h-full max-h-[500px] md:max-h-none items-start">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full flex-shrink-0">
                        <Skeleton className="h-8 w-32" />
                        <div className="flex gap-2 flex-wrap">
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-8 w-28" />
                        </div>
                    </div>
                    <div className="flex-1 min-h-0 overflow-y-auto w-full px-1">
                        <div className="space-y-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <Skeleton className="w-3 h-3 rounded-full" />
                                        <Skeleton className="w-0.5 h-16 mt-2" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex gap-2">
                                            <Skeleton className="h-4 w-20" />
                                            <Skeleton className="h-4 w-16" />
                                        </div>
                                        <Skeleton className="h-6 w-24 rounded-full" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
