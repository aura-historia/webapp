import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils.ts";

/** Wait before the check animates, so readers who just reached the end actually see it. */
const COMPLETION_ANIMATION_DELAY_MS = 500;

type ListLoaderRowProps = {
    readonly isFetchingNextPage: boolean;
    readonly totalCount?: number;
    readonly loadingMoreKey?: string;
    readonly allLoadedKey?: string;
    readonly allLoadedFallbackKey?: string;
    readonly allLoadedValues?: Record<string, string>;
    /** Mono counter beside the loading label, e.g. "30 of 1,284". */
    readonly progress?: string;
    readonly className?: string;
};

/**
 * The row under an infinite list: a spinner while the next page loads, then an oxblood check and
 * the all-loaded message. The check pops in once, shortly after the row scrolls into view.
 */
export function ListLoaderRow({
    isFetchingNextPage,
    totalCount,
    loadingMoreKey = "search.messages.loadingMore",
    allLoadedKey = "search.messages.allLoaded",
    allLoadedFallbackKey = "search.messages.allLoadedFallback",
    allLoadedValues,
    progress,
    className,
}: ListLoaderRowProps) {
    const { t } = useTranslation();
    const { ref, inView } = useInView();
    const [checkPlayed, setCheckPlayed] = useState(false);

    useEffect(() => {
        if (!inView || isFetchingNextPage || checkPlayed) return;

        const timeoutId = window.setTimeout(
            () => setCheckPlayed(true),
            COMPLETION_ANIMATION_DELAY_MS,
        );
        return () => window.clearTimeout(timeoutId);
    }, [inView, isFetchingNextPage, checkPlayed]);

    return (
        <div
            ref={ref}
            role="status"
            className={cn(
                "mt-14 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-line-subtle py-6 text-center text-body-sm",
                isFetchingNextPage ? "text-ink-muted" : "text-ink-secondary",
                className,
            )}
        >
            {isFetchingNextPage ? (
                <>
                    <Loader2
                        aria-hidden="true"
                        className="size-4 animate-spin motion-reduce:animate-none"
                    />
                    {t(loadingMoreKey)}
                    {progress && (
                        <span className="font-mono text-tag tracking-[0.14em] uppercase">
                            {progress}
                        </span>
                    )}
                </>
            ) : (
                <>
                    <span
                        aria-hidden="true"
                        data-testid="list-loader-check"
                        data-played={checkPlayed}
                        className={cn(
                            "inline-flex size-6 items-center justify-center rounded-pill bg-oxblood text-on-oxblood motion-reduce:animate-none motion-reduce:opacity-100",
                            checkPlayed ? "animate-check-pop" : "opacity-0",
                        )}
                    >
                        <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={3}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="size-3"
                        >
                            <path
                                d="M5 12.5l4.5 4.5L19 7.5"
                                pathLength={1}
                                className={cn(
                                    checkPlayed &&
                                        "animate-check-draw [stroke-dasharray:1] motion-reduce:animate-none motion-reduce:[stroke-dasharray:none]",
                                )}
                            />
                        </svg>
                    </span>
                    {totalCount
                        ? t(allLoadedKey, { count: totalCount, ...allLoadedValues })
                        : t(allLoadedFallbackKey, allLoadedValues)}
                </>
            )}
        </div>
    );
}
