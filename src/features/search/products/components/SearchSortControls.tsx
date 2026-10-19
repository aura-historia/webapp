import { ArrowDownWideNarrow, ChevronDown } from "lucide-react";
import { useId } from "react";
import { useTranslation } from "react-i18next";
import {
    getSortModeFieldLabel,
    SEARCH_RESULT_SORT_FIELDS,
    type SortMode,
} from "@/data/internal/search/SortMode.ts";
import { cn } from "@/lib/utils.ts";

const FOCUS_CLASS =
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass";
const PILL_CLASS = "rounded-pill shadow-[inset_0_0_0_1px_var(--line-strong)]";

type SearchSortControlsProps = {
    readonly sortMode: SortMode;
    readonly onChange: (sortMode: SortMode) => void;
    /** `toolbar`: 40px pills with the order spelled out; `compact`: 44px, full-width select. */
    readonly layout: "toolbar" | "compact";
};

/** "Sort by" select and the ascending / descending switch. */
export function SearchSortControls({ sortMode, onChange, layout }: SearchSortControlsProps) {
    const { t } = useTranslation();
    const selectId = useId();
    const isCompact = layout === "compact";
    const isDescending = sortMode.order === "DESC";
    const orderLabel = t(isDescending ? "search.sortMode.order.desc" : "search.sortMode.order.asc");

    return (
        <>
            <div
                className={cn(
                    "relative flex items-center focus-within:outline-2 focus-within:outline-offset-3 focus-within:outline-brass",
                    PILL_CLASS,
                    isCompact ? "h-11 min-w-0 flex-1" : "h-10",
                )}
            >
                <label
                    htmlFor={selectId}
                    className="shrink-0 pt-px pl-4 font-mono text-tag leading-none tracking-[0.14em] whitespace-nowrap text-ink-muted uppercase"
                >
                    {t("search.sortMode.sortBy")}
                </label>
                <select
                    id={selectId}
                    value={sortMode.field}
                    onChange={(event) =>
                        onChange({ ...sortMode, field: event.target.value as SortMode["field"] })
                    }
                    className={cn(
                        "h-full min-w-0 cursor-pointer appearance-none bg-transparent pr-9 pl-2 leading-none font-medium text-ink outline-none",
                        isCompact ? "flex-1 text-base" : "text-sm",
                    )}
                >
                    {SEARCH_RESULT_SORT_FIELDS.map((field) => (
                        <option key={field} value={field}>
                            {t(getSortModeFieldLabel(field))}
                        </option>
                    ))}
                </select>
                <ChevronDown
                    aria-hidden="true"
                    strokeWidth={1.8}
                    className="pointer-events-none absolute right-3.5 size-3.5 text-ink-muted"
                />
            </div>
            <button
                type="button"
                onClick={() => onChange({ ...sortMode, order: isDescending ? "ASC" : "DESC" })}
                aria-label={t(
                    isDescending
                        ? "search.sortMode.order.switchToAsc"
                        : "search.sortMode.order.switchToDesc",
                )}
                className={cn(
                    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 text-sm font-medium text-ink",
                    PILL_CLASS,
                    isCompact ? "size-11" : "h-10 px-3.5",
                    FOCUS_CLASS,
                )}
            >
                <ArrowDownWideNarrow
                    aria-hidden="true"
                    strokeWidth={1.8}
                    className={cn("size-4", !isDescending && "-scale-y-100")}
                />
                {!isCompact && orderLabel}
            </button>
        </>
    );
}
