import { ArrowDownWideNarrow } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
    getSortModeFieldLabel,
    SEARCH_RESULT_SORT_FIELDS,
    type SortMode,
} from "@/data/internal/search/SortMode.ts";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
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
    const isCompact = layout === "compact";
    const isDescending = sortMode.order === "DESC";
    const orderLabel = t(isDescending ? "search.sortMode.order.desc" : "search.sortMode.order.asc");

    return (
        <>
            <Select
                value={sortMode.field}
                onValueChange={(field) =>
                    onChange({ ...sortMode, field: field as SortMode["field"] })
                }
            >
                <SelectTrigger
                    className={cn(
                        "cursor-pointer gap-2 border-0 bg-transparent pr-3.5 pl-4 font-medium text-ink dark:bg-transparent dark:hover:bg-transparent [&_svg:not([class*='text-'])]:text-ink-muted",
                        "focus-visible:ring-0",
                        PILL_CLASS,
                        FOCUS_CLASS,
                        isCompact
                            ? "min-w-0 flex-1 text-base data-[size=default]:h-11"
                            : "text-sm data-[size=default]:h-10",
                    )}
                >
                    <span className="shrink-0 pt-px font-mono text-tag leading-none font-normal tracking-[0.14em] whitespace-nowrap text-ink-muted uppercase">
                        {t("search.sortMode.sortBy")}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-left leading-none">
                        <SelectValue />
                    </span>
                </SelectTrigger>
                <SelectContent
                    data-theme="light"
                    align="end"
                    sideOffset={6}
                    className="z-[70] min-w-48 rounded-panel border-0 bg-surface-raised p-1 text-ink shadow-menu"
                >
                    {SEARCH_RESULT_SORT_FIELDS.map((field) => (
                        <SelectItem
                            key={field}
                            value={field}
                            className="min-h-11 cursor-pointer rounded-md px-2.5 pr-9 text-sm text-ink focus:bg-surface-sunken focus:text-ink data-[state=checked]:font-medium [&_svg:not([class*='text-'])]:text-oxblood"
                        >
                            {t(getSortModeFieldLabel(field))}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
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
