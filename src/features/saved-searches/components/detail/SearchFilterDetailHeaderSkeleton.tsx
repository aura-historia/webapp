import { cn } from "@/lib/utils.ts";
import { PAGE_COLUMN_CLASS } from "@/features/saved-searches/lib/searchFilterStyles.ts";

const ROW_IDS = ["row-1", "row-2", "row-3", "row-4"] as const;
const BAR = "rounded-xs bg-surface-sunken";

/** Loading stand-in for the detail page's header and the criteria band. */
export function SearchFilterDetailHeaderSkeleton() {
    return (
        <div
            aria-hidden="true"
            data-testid="search-filter-detail-skeleton"
            className="animate-pulse motion-reduce:animate-none"
        >
            <div
                className={cn(
                    PAGE_COLUMN_CLASS,
                    "flex flex-col gap-4 pt-[76px] pb-10 sm:pt-[100px]",
                )}
            >
                <div className={cn(BAR, "h-2.5 w-[120px]")} />
                <div className={cn(BAR, "h-11 w-[55%]")} />
                <div className={cn(BAR, "h-3 w-[200px]")} />
                <div className="flex flex-wrap gap-2 pt-2">
                    <div className="h-11 w-[190px] rounded-pill bg-surface-sunken" />
                    <div className="h-11 w-[100px] rounded-pill bg-surface-sunken" />
                    <div className="h-11 w-[84px] rounded-pill bg-surface-sunken" />
                </div>
            </div>
            <div data-theme="dark" className="bg-surface">
                <div
                    className={cn(
                        PAGE_COLUMN_CLASS,
                        "grid gap-6 py-9 sm:py-14 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-14",
                    )}
                >
                    <div className="flex flex-col gap-3">
                        <div className={cn(BAR, "h-[26px] w-[80%]")} />
                        <div className={cn(BAR, "h-3 w-full")} />
                        <div className={cn(BAR, "h-3 w-[70%]")} />
                    </div>
                    <div className="grid grid-cols-1 gap-6 rounded-panel bg-surface-raised px-7 py-6 shadow-ring sm:grid-cols-2">
                        {ROW_IDS.map((id) => (
                            <div key={id} className="flex flex-col gap-2.5">
                                <div className={cn(BAR, "h-2.5 w-[90px]")} />
                                <div className="h-6 w-[70%] rounded-sm bg-surface-sunken" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
