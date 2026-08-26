import {
    getShopSortModeFieldLabel,
    SHOP_SEARCH_SORT_FIELDS,
    type ShopSortMode,
} from "@/data/internal/search/ShopSortMode.ts";
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

export type ShopSortModeSelectionProps = {
    readonly sortMode: ShopSortMode;
    readonly updateSortMode: (newSortMode: ShopSortMode) => void;
    readonly className?: string;
};

export function ShopSortModeSelection({
    sortMode,
    updateSortMode,
    className,
}: ShopSortModeSelectionProps) {
    const { t } = useTranslation();

    return (
        <div
            className={cn(
                "flex flex-col sm:flex-row sm:flex-wrap items-center gap-x-4 sm:gap-y-2",
                className,
            )}
        >
            <div className="flex items-center gap-1 sm:gap-3">
                <span className="text-[10px] sm:text-xs font-normal tracking-[0.1em] uppercase text-on-surface-variant/70">
                    {t("search.sortMode.sortBy")}
                </span>
                <Select
                    onValueChange={(value: ShopSortMode["field"]) => {
                        updateSortMode({ ...sortMode, field: value });
                    }}
                    value={sortMode.field}
                >
                    <SelectTrigger className="h-6 rounded-none border-0 bg-transparent p-0 sm:pr-5 text-xs font-bold text-primary shadow-none hover:bg-transparent focus-visible:ring-0 dark:bg-transparent dark:hover:bg-transparent">
                        {t(getShopSortModeFieldLabel(sortMode.field))}
                    </SelectTrigger>
                    <SelectContent className="border-outline-variant">
                        <SelectGroup>
                            {SHOP_SEARCH_SORT_FIELDS.map((field) => (
                                <SelectItem key={field} value={field}>
                                    {t(getShopSortModeFieldLabel(field))}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center gap-1 sm:gap-3">
                <span className="text-[10px] sm:text-xs font-normal tracking-[0.1em] uppercase text-on-surface-variant/70">
                    {t("search.sortMode.order.label")}
                </span>
                <Select
                    onValueChange={(value: ShopSortMode["order"]) => {
                        updateSortMode({ ...sortMode, order: value });
                    }}
                    value={sortMode.order}
                >
                    <SelectTrigger className="h-6 rounded-none border-0 bg-transparent p-0 sm:pr-5 text-xs font-bold text-primary shadow-none hover:bg-transparent focus-visible:ring-0 dark:bg-transparent dark:hover:bg-transparent">
                        <span className="inline-flex items-center gap-1 sm:gap-1.5">
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
