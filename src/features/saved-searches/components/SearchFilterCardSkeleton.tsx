/** Loading stand-in shaped like a watching card on the ink band. */
export function SearchFilterCardSkeleton() {
    return (
        <div
            aria-hidden="true"
            data-testid="search-filter-card-skeleton"
            className="flex animate-pulse flex-col gap-4 rounded-card bg-surface-raised p-7 shadow-ring motion-reduce:animate-none"
        >
            <div className="flex justify-between">
                <div className="h-2.5 w-12 rounded-xs bg-surface-sunken" />
                <div className="h-9 w-[88px] rounded-pill bg-surface-sunken" />
            </div>
            <div className="h-7 w-[72%] rounded-xs bg-surface-sunken" />
            <div className="h-3.5 w-[48%] rounded-xs bg-surface-sunken" />
            <div className="h-2.5 w-[90%] rounded-xs bg-surface-sunken" />
            <div className="flex justify-between border-t border-line-subtle pt-3.5">
                <div className="h-3.5 w-[120px] rounded-xs bg-surface-sunken" />
                <div className="h-3.5 w-[140px] rounded-xs bg-surface-sunken" />
            </div>
        </div>
    );
}

/** Loading stand-in shaped like a resting row. */
export function SearchFilterRowSkeleton() {
    return (
        <div
            aria-hidden="true"
            data-testid="search-filter-row-skeleton"
            className="grid animate-pulse grid-cols-1 gap-3 border-b border-line py-[18px] motion-reduce:animate-none lg:grid-cols-[170px_minmax(0,1fr)_minmax(0,1fr)_160px] lg:items-center lg:gap-6"
        >
            <div className="h-2.5 w-[110px] rounded-xs bg-surface-sunken" />
            <div className="flex flex-col gap-2">
                <div className="h-[18px] w-[70%] rounded-xs bg-surface-sunken" />
                <div className="h-3 w-[45%] rounded-xs bg-surface-sunken" />
            </div>
            <div className="h-3 w-[80%] rounded-xs bg-surface-sunken" />
            <div className="h-10 w-[120px] rounded-pill bg-surface-sunken lg:justify-self-end" />
        </div>
    );
}
