import { LANDING_PAGE_FRAGMENTS } from "@/features/landing/config/landingPageFragments.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";

const SKELETON_CARD_IDS = ["first", "second", "third"] as const;

export function RecentlyAddedSectionSkeleton() {
    return (
        <section
            id={LANDING_PAGE_FRAGMENTS.recentlyAdded}
            data-testid="recently-added-section-skeleton"
            className="bg-muted/30 py-16"
            aria-hidden="true"
        >
            <div className="mx-auto w-full max-w-7xl px-4 py-2">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-12 w-64 max-w-full sm:h-14 sm:w-80" />
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        <Skeleton className="size-12 rounded-xl" />
                        <Skeleton className="size-12 rounded-xl" />
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {SKELETON_CARD_IDS.map((id, index) => (
                        <div
                            key={id}
                            className={
                                index === 1
                                    ? "hidden sm:block"
                                    : index === 2
                                      ? "hidden lg:block"
                                      : undefined
                            }
                        >
                            <div className="h-full pt-2">
                                <div className="flex h-full flex-col bg-card">
                                    <Skeleton className="aspect-4/5 w-full rounded-none" />
                                    <div className="flex flex-1 flex-col gap-3 px-1 pt-4">
                                        <Skeleton className="h-5 w-24 rounded-none" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-8 w-11/12" />
                                            <Skeleton className="h-8 w-3/4" />
                                        </div>
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-2/3" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
