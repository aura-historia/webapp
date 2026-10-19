import { SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils.ts";
import { NAV_FOCUS_CLASS } from "./navigationConfig.ts";
import { NavSearchField } from "./NavSearchField.tsx";

interface MobileAppBarProps {
    /** Active filters; shows a count on the filter button. */
    readonly filterCount: number;
    readonly filtersOpen: boolean;
    readonly onFilters: () => void;
    /** Id of the filter drawer, for `aria-controls`. */
    readonly filtersId?: string;
    readonly className?: string;
}

/** The phone search bar under the header: full-width search and the filter button. */
export function MobileAppBar({
    filterCount,
    filtersOpen,
    onFilters,
    filtersId,
    className,
}: MobileAppBarProps) {
    const { t } = useTranslation();

    return (
        <div
            className={cn(
                "flex items-center gap-2 bg-surface-bar px-3.5 py-2.5 shadow-[inset_0_-1px_0_var(--line-subtle)]",
                className,
            )}
        >
            <NavSearchField variant="bar" className="flex-1" />
            <button
                type="button"
                onClick={onFilters}
                aria-expanded={filtersOpen}
                aria-controls={filtersId}
                aria-label={
                    filterCount > 0
                        ? t("search.filtersWithCount", { count: filterCount })
                        : t("search.filters")
                }
                className={cn(
                    "relative inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-field bg-surface-raised text-ink shadow-[inset_0_0_0_1px_var(--line)]",
                    NAV_FOCUS_CLASS,
                )}
            >
                <SlidersHorizontal aria-hidden="true" className="size-[18px]" strokeWidth={1.8} />
                {filterCount > 0 && (
                    <span
                        aria-hidden="true"
                        className="absolute -top-[5px] -right-[5px] inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-pill bg-oxblood px-[5px] font-mono text-[10px] text-on-oxblood"
                    >
                        {filterCount}
                    </span>
                )}
            </button>
        </div>
    );
}
