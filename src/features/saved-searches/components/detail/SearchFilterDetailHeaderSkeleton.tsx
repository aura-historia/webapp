import { Skeleton } from "@/components/ui/skeleton.tsx";

const TILE_IDS = ["tile-1", "tile-2", "tile-3", "tile-4"] as const;

export function SearchFilterDetailHeaderSkeleton() {
    return (
        <header
            className="flex flex-col gap-6 border-b border-border/30 pb-8"
            data-testid="section-configuration-skeleton"
        >
            <div className="flex flex-row items-start justify-between gap-4">
                <div className="flex min-w-0 flex-col gap-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-9 w-64" />
                </div>
                <div className="flex shrink-0 gap-2">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <Skeleton className="h-6 w-56" />
                <Skeleton className="h-4 w-96 max-w-full" />
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
                {TILE_IDS.map((id) => (
                    <div key={id} className="flex flex-col gap-2">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-6 w-24" />
                    </div>
                ))}
            </div>
        </header>
    );
}
