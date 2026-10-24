import { useLayoutEffect } from "react";
import { SearchResultCardSkeleton } from "@/features/search/products/components/results/SearchResultPlaceholders.tsx";
import { cn } from "@/lib/utils.ts";

const BLOCK = "bg-surface-sunken";
const THUMBNAIL_IDS = ["t1", "t2", "t3", "t4", "t5", "t6"];
const DESCRIPTION_LINES = [
    { id: "d1", width: "100%" },
    { id: "d2", width: "94%" },
    { id: "d3", width: "98%" },
    { id: "d4", width: "66%" },
    { id: "d5", width: "96%", gap: true },
    { id: "d6", width: "90%" },
    { id: "d7", width: "52%" },
];

/** Mirrors the detail page: gallery, summary column with description, price history, history and rail. */
export function ProductDetailPageSkeleton() {
    useLayoutEffect(() => {
        globalThis.scrollTo({ top: 0, left: 0 });
    }, []);

    return (
        <div
            aria-busy="true"
            data-testid="product-detail-skeleton"
            className="mx-auto w-full max-w-[calc(var(--container-content)+2*var(--page-gutter))] px-(--page-gutter) pt-0 pb-16 sm:pt-10 sm:pb-28"
        >
            <div aria-hidden="true" className="animate-pulse motion-reduce:animate-none">
                <section className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
                    <div className="flex flex-col gap-3">
                        <div className="aspect-[4/5] bg-image-ground max-sm:-mx-(--page-gutter) sm:rounded-figure" />
                        <div className="hidden grid-cols-6 gap-3 sm:grid">
                            {THUMBNAIL_IDS.map((id) => (
                                <div
                                    key={id}
                                    className="aspect-square rounded-md bg-image-ground"
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-7">
                        <div className="flex items-center justify-between">
                            <div className={cn("h-7 w-28 rounded-pill", BLOCK)} />
                            <div className="flex gap-1">
                                <div className={cn("size-11 rounded-pill", BLOCK)} />
                                <div className={cn("size-11 rounded-pill", BLOCK)} />
                            </div>
                        </div>
                        <div className="flex flex-col gap-3.5">
                            <div className={cn("h-[11px] w-[34%] rounded-xs", BLOCK)} />
                            <div className={cn("h-10 w-[96%] rounded-sm", BLOCK)} />
                            <div className={cn("h-10 w-[64%] rounded-sm", BLOCK)} />
                        </div>
                        <div className="flex flex-col gap-5 border-t border-line pt-6">
                            <div className={cn("h-11 w-[38%] rounded-sm", BLOCK)} />
                            <div className="flex h-[46px] items-center justify-between border-y border-line-subtle">
                                <div className={cn("h-2.5 w-18 rounded-xs", BLOCK)} />
                                <div className={cn("h-4 w-30 rounded-xs", BLOCK)} />
                            </div>
                            <div className={cn("h-13 rounded-pill", BLOCK)} />
                            <div className="h-13 rounded-pill shadow-[inset_0_0_0_1px_var(--color-line)]" />
                        </div>
                        <div className="flex flex-col gap-[13px] border-t border-line pt-7">
                            <div className={cn("mb-1.5 h-6 w-[150px] rounded-sm", BLOCK)} />
                            {DESCRIPTION_LINES.map((line) => (
                                <div
                                    key={line.id}
                                    className={cn("h-3 rounded-xs", BLOCK, line.gap && "mt-2.5")}
                                    style={{ width: line.width }}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                <div className="mt-14 rounded-figure bg-surface-raised p-5 shadow-ring sm:mt-24 sm:p-8">
                    <div className="mb-7 flex items-center justify-between gap-6">
                        <div className={cn("h-8 w-[220px] rounded-sm", BLOCK)} />
                        <div className={cn("hidden h-10 w-[360px] rounded-pill sm:block", BLOCK)} />
                    </div>
                    <div className="h-60 rounded-md bg-[repeating-linear-gradient(180deg,transparent_0_79px,var(--color-line-subtle)_79px_80px)] sm:h-80" />
                </div>

                <div className="mt-14 grid grid-cols-1 gap-14 sm:mt-24 lg:gap-16 xl:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
                    <div className="flex flex-col gap-4">
                        <div className={cn("h-8 w-40 rounded-sm", BLOCK)} />
                        <div className={cn("h-11 w-full rounded-sm", BLOCK)} />
                        <div className={cn("h-24 w-full rounded-sm", BLOCK)} />
                        <div className={cn("h-24 w-full rounded-sm", BLOCK)} />
                    </div>
                    <div className="flex flex-col gap-6">
                        <div className={cn("h-8 w-48 rounded-sm", BLOCK)} />
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {["s1", "s2", "s3"].map((id, index) => (
                                <div
                                    key={id}
                                    className={cn(
                                        index > 0 && "max-sm:hidden",
                                        index > 1 && "max-lg:hidden",
                                    )}
                                >
                                    <SearchResultCardSkeleton />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
