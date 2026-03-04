import { Skeleton } from "@/components/ui/skeleton.tsx";

export function CategoryHeaderSkeleton() {
    return (
        <div className="flex flex-col gap-2">
            <Skeleton className="h-9 sm:h-10 w-64" />
            <Skeleton className="h-5 w-full max-w-xl" />
        </div>
    );
}
