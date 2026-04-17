import {
    getSortModeFieldLabel,
    SEARCH_RESULT_SORT_FIELDS,
    type SortMode,
} from "@/data/internal/search/SortMode.ts";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select.tsx";
import { useTranslation } from "react-i18next";
import { SortAsc, SortDesc } from "lucide-react";
import { cn } from "@/lib/utils.ts";

export type SortModeSelectionProps = {
    readonly sortMode: SortMode;
    readonly updateSortMode: (newSortMode: SortMode) => void;
    readonly className?: string;
};

export function SortModeSelection({ sortMode, updateSortMode, className }: SortModeSelectionProps) {
    const { t } = useTranslation();

    return (
        <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2", className)}>
            <div className="flex items-center gap-3">
                <span className="text-xs font-normal tracking-[0.1em] uppercase text-on-surface-variant/70">
                    {t("search.sortMode.sortBy")}
                </span>
                <Select
                    onValueChange={(value: SortMode["field"]) => {
                        updateSortMode({ ...sortMode, field: value });
                    }}
                    value={sortMode.field}
                >
                    <SelectTrigger className="h-6 rounded-none border-0 bg-transparent p-0 pr-5 text-xs font-bold text-primary shadow-none hover:bg-transparent focus-visible:ring-0 dark:bg-transparent dark:hover:bg-transparent">
                        {t(getSortModeFieldLabel(sortMode.field))}
                    </SelectTrigger>
                    <SelectContent className="border-outline-variant">
                        <SelectGroup>
                            {SEARCH_RESULT_SORT_FIELDS.map((field) => (
                                <SelectItem key={field} value={field}>
                                    {t(getSortModeFieldLabel(field))}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center gap-3">
                <span className="text-xs font-normal tracking-[0.1em] uppercase text-on-surface-variant/70">
                    {t("search.sortMode.order.label")}
                </span>
                <Select
                    onValueChange={(value: SortMode["order"]) => {
                        updateSortMode({ ...sortMode, order: value });
                    }}
                    value={sortMode.order}
                >
                    <SelectTrigger className="h-6 rounded-none border-0 bg-transparent p-0 pr-5 text-xs font-bold text-primary shadow-none hover:bg-transparent focus-visible:ring-0 dark:bg-transparent dark:hover:bg-transparent">
                        <span className="inline-flex items-center gap-1.5">
                            {sortMode.order === "ASC" ? (
                                <SortAsc className="h-4 w-4" />
                            ) : (
                                <SortDesc className="h-4 w-4" />
                            )}
                            {t(
                                sortMode.order === "ASC"
                                    ? "search.sortMode.order.asc"
                                    : "search.sortMode.order.desc",
                            )}
                        </span>
                    </SelectTrigger>
                    <SelectContent className="border-outline-variant">
                        <SelectGroup>
                            <SelectItem value="ASC">
                                <SortAsc /> {t("search.sortMode.order.asc")}
                            </SelectItem>
                            <SelectItem value="DESC">
                                <SortDesc /> {t("search.sortMode.order.desc")}
                            </SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
