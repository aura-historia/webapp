import { Badge } from "@/components/ui/badge.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { Filter } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

type Props = {
    readonly filterId: string;
    readonly filterName?: string;
    readonly matchReason?: string;
};

export function SearchFilterMatchBadge({ filterId, filterName, matchReason }: Props) {
    const { t } = useTranslation();

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Link
                    to="/$lng/me/search-filter/$filterId"
                    params={(current) => ({ ...current, filterId })}
                    from="/$lng"
                >
                    <Badge className="bg-tertiary text-tertiary-foreground py-1 gap-1 cursor-pointer">
                        <Filter className="w-3 h-3" />
                        {t("product.searchFilter.matchedBadge")}
                    </Badge>
                </Link>
            </TooltipTrigger>
            {(filterName ?? matchReason) && (
                <TooltipContent className="max-w-64 flex flex-col gap-1">
                    {filterName && <span className="font-semibold">{filterName}</span>}
                    {matchReason && (
                        <span className="text-sm text-muted-foreground">{matchReason}</span>
                    )}
                </TooltipContent>
            )}
        </Tooltip>
    );
}
