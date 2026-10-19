import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import { useDescribeActiveFilter } from "@/features/search/products/hooks/useDescribeActiveFilter.ts";
import {
    getActiveFilters,
    removeActiveFilter,
} from "@/features/search/products/lib/activeFilters.ts";
import { cn } from "@/lib/utils.ts";

const FOCUS_CLASS =
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass";

type ActiveFilterChipsProps = {
    readonly searchArgs: SearchFilterArguments;
    readonly onChange: (next: SearchFilterArguments) => void;
    readonly onResetAll: () => void;
    /** `wrap` between hairlines on desktop; `scroll` as one swipeable row on phones. */
    readonly layout: "wrap" | "scroll";
    readonly className?: string;
};

/** The applied filters as removable chips, so they stay visible while the filters are closed. */
export function ActiveFilterChips({
    searchArgs,
    onChange,
    onResetAll,
    layout,
    className,
}: ActiveFilterChipsProps) {
    const { t } = useTranslation();
    const describe = useDescribeActiveFilter();
    const filters = getActiveFilters(searchArgs);

    if (filters.length === 0) return null;

    const isScroll = layout === "scroll";

    return (
        <div
            role="group"
            aria-label={t("search.activeFilters")}
            className={cn(
                "flex items-center gap-2",
                isScroll
                    ? "-mx-5 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    : "flex-wrap border-y border-line-subtle py-4",
                className,
            )}
        >
            {filters.map((filter) => {
                const { key, value } = describe(filter);
                return (
                    <button
                        key={filter.id}
                        type="button"
                        aria-label={t("search.chip.remove", { label: `${key} ${value}` })}
                        onClick={() => onChange(removeActiveFilter(searchArgs, filter))}
                        className={cn(
                            "inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-pill bg-surface-sunken text-meta whitespace-nowrap text-ink",
                            isScroll ? "h-9 pr-2.5 pl-3.5" : "h-8 pr-2 pl-3",
                            FOCUS_CLASS,
                        )}
                    >
                        <span className="text-ink-muted">{key}</span>
                        {value}
                        <X aria-hidden="true" className="size-3 text-ink-muted" strokeWidth={2.2} />
                    </button>
                );
            })}
            {!isScroll && (
                <button
                    type="button"
                    onClick={onResetAll}
                    className={cn(
                        "h-8 cursor-pointer px-1.5 text-meta font-medium text-ink underline decoration-line-strong underline-offset-3 hover:text-brass-ink",
                        FOCUS_CLASS,
                    )}
                >
                    {t("search.resetAllFilters")}
                </button>
            )}
        </div>
    );
}
