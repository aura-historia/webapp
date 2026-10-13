import { Badge } from "@/components/ui/badge.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { Filter } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

type Props = {
    readonly filterId: string;
    readonly filterName?: string;
};

export function SearchFilterMatchBadge({ filterId, filterName }: Props) {
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
            {filterName && (
                <TooltipContent className="max-w-64">
                    <span className="font-semibold">{filterName}</span>
                </TooltipContent>
            )}
        </Tooltip>
    );
}
