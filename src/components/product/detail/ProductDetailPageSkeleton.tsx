import { Skeleton } from "@/components/ui/skeleton.tsx";

export function ProductDetailPageSkeleton() {
    return (
        <div className="mx-auto w-full max-w-[1280px] px-4 pb-20 pt-8 md:px-8">
            <section className="grid grid-cols-1 gap-8 pb-8 lg:grid-cols-12 lg:gap-12">
                <div className="lg:col-span-7 space-y-6">
                    <Skeleton className="w-full aspect-[5/6] rounded-none" />
                    <div className="grid grid-cols-4 gap-2">
                        {[1, 2, 3, 4].map((thumbnail) => (
                            <Skeleton
                                key={thumbnail}
                                className="aspect-square w-full rounded-none"
                            />
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-5 flex min-w-0 flex-col">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-wrap gap-2">
                            <Skeleton className="h-6 w-24 rounded-full" />
                            <Skeleton className="h-6 w-24 rounded-full" />
                            <Skeleton className="h-6 w-28 rounded-full" />
                        </div>
                        <div className="hidden md:flex gap-2">
                            <Skeleton className="h-10 w-10 rounded-none" />
                            <Skeleton className="h-10 w-10 rounded-none" />
                        </div>
                    </div>

                    <Skeleton className="mt-8 h-12 w-5/6 rounded-none" />
                    <Skeleton className="mt-3 h-4 w-40 rounded-none" />

                    <div className="mt-5 flex flex-wrap items-end gap-3">
                        <Skeleton className="h-12 w-44 rounded-none" />
                        <Skeleton className="h-6 w-28 rounded-none" />
                    </div>

                    <div className="mt-8 flex flex-col gap-3">
                        <Skeleton className="h-14 w-full rounded-none" />
                        <Skeleton className="h-14 w-full rounded-none" />
                    </div>

                    <div className="mt-8 space-y-4 border-t border-border/30 pt-8">
                        {[1, 2, 3, 4].map((row) => (
                            <div key={row} className="flex items-center justify-between gap-4">
                                <Skeleton className="h-4 w-1/3 rounded-none" />
                                <Skeleton className="h-4 w-2/5 rounded-none" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 gap-8 border-y border-border/30 pt-8 pb-16 lg:grid-cols-12 lg:gap-12">
                <div className="lg:col-span-4">
                    <Skeleton className="h-8 w-48 rounded-none" />
                    <Skeleton className="mt-4 h-0.5 w-12 rounded-none" />
                </div>
                <div className="lg:col-span-8">
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-full rounded-none" />
                        <Skeleton className="h-4 w-full rounded-none" />
                        <Skeleton className="h-4 w-4/5 rounded-none" />
                    </div>
                    <div className="mt-6 border-l-4 border-primary/20 bg-surface-container-low px-6 py-5 space-y-3">
                        <Skeleton className="h-4 w-40 rounded-none" />
                        <Skeleton className="h-4 w-full rounded-none" />
                        <Skeleton className="h-4 w-3/4 rounded-none" />
                    </div>
                </div>
            </section>

            <div className="mt-16">
                <section className="flex min-w-0 flex-col gap-8">
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-start">
                        <div>
                            <Skeleton className="h-8 w-56 rounded-none" />
                            <Skeleton className="mt-4 h-0.5 w-12 rounded-none" />
                        </div>
                        <div className="flex gap-4 flex-wrap items-end">
                            {[1, 2, 3, 4, 5, 6, 7].map((range) => (
                                <Skeleton key={range} className="h-4 w-10 rounded-none" />
                            ))}
                        </div>
                    </div>
                    <Skeleton className="min-h-75 w-full border border-outline-variant/10 bg-surface-container-low rounded-none" />
                </section>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-12">
                <div className="lg:col-span-4">
                    <section className="flex h-full min-w-0 flex-col gap-6">
                        <div className="flex flex-col gap-4 w-full flex-shrink-0">
                            <div>
                                <Skeleton className="h-8 w-40 rounded-none" />
                                <Skeleton className="mt-4 h-0.5 w-12 rounded-none" />
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <Skeleton className="h-4 w-14 rounded-none" />
                                <Skeleton className="h-4 w-16 rounded-none" />
                                <Skeleton className="h-4 w-24 rounded-none" />
                            </div>
                        </div>

                        <div className="space-y-5">
                            {[1, 2, 3, 4].map((item) => (
                                <div key={item} className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <Skeleton className="h-2.5 w-2.5 rounded-full" />
                                        <Skeleton className="mt-2 h-16 w-0.5 rounded-none" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-28 rounded-none" />
                                        <Skeleton className="h-4 w-2/3 rounded-none" />
                                        <Skeleton className="h-4 w-5/6 rounded-none" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="lg:col-span-8">
                    <section className="flex min-w-0 flex-col gap-6">
                        <div>
                            <Skeleton className="h-8 w-56 rounded-none" />
                            <Skeleton className="mt-4 h-0.5 w-12 rounded-none" />
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {[1, 2, 3].map((card) => (
                                <div
                                    key={card}
                                    className="border border-outline-variant/10 bg-surface-container-low"
                                >
                                    <Skeleton className="aspect-video w-full rounded-none" />
                                    <div className="space-y-3 p-4">
                                        <Skeleton className="h-4 w-full rounded-none" />
                                        <Skeleton className="h-4 w-3/4 rounded-none" />
                                        <Skeleton className="h-4 w-1/2 rounded-none" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
