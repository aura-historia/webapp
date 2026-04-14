import { Skeleton } from "@/components/ui/skeleton.tsx";

export function CategoryHeaderSkeleton() {
    return (
        <div className="flex flex-col">
            <Skeleton className="h-85 w-full md:h-130" />
            <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 md:grid-cols-[minmax(220px,320px)_1fr] md:items-start md:gap-12 md:px-10 md:py-14">
                <Skeleton className="aspect-square w-full max-w-[320px]" />
                <div className="space-y-4">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-6 w-full max-w-3xl" />
                    <Skeleton className="h-6 w-full max-w-2xl" />
                    <Skeleton className="h-12 w-48" />
                </div>
            </div>
        </div>
    );
}
