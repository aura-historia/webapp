import {
    getSortModeLabel,
    SEARCH_RESULT_SORT_FIELDS,
    type SortMode,
} from "@/data/internal/SortMode.ts";
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

export type OrderSelectionProps = {
    readonly sortMode: SortMode;
    readonly updateSortMode: (newSortMode: SortMode) => void;
    readonly className?: string;
};

export function SortModeSelection({ sortMode, updateSortMode, className }: OrderSelectionProps) {
    const { t } = useTranslation();

    return (
        <div className={cn("flex flex-row items-center gap-2", className)}>
            <Select
                onValueChange={(value: SortMode["field"]) => {
                    updateSortMode({ ...sortMode, field: value });
                    console.log("value changed: ", value);
                }}
                defaultValue={sortMode.field}
            >
                <SelectTrigger>{t(getSortModeLabel(sortMode))}</SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {SEARCH_RESULT_SORT_FIELDS.map((field) => (
                            <SelectItem key={field} value={field}>
                                {t(
                                    getSortModeLabel({
                                        field,
                                        order: sortMode.order,
                                    }),
                                )}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
            <Select
                onValueChange={(value: SortMode["order"]) => {
                    updateSortMode({ ...sortMode, order: value });
                }}
                defaultValue={sortMode.order}
            >
                <SelectTrigger>
                    {sortMode.order === "ASC" ? <SortAsc /> : <SortDesc />}
                </SelectTrigger>
                <SelectContent>
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
    );
}
