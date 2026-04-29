import { Badge } from "@/components/ui/badge.tsx";
import { CalendarClock } from "lucide-react";
import type { AuctionWindow } from "@/data/internal/product/AuctionWindow.ts";
import { useTranslation } from "react-i18next";
import { useRouteContext } from "@tanstack/react-router";
import { cn, formatShortDate } from "@/lib/utils.ts";

interface AuctionWindowBadgeProps {
    readonly auction: AuctionWindow;
    readonly className?: string;
}

export function AuctionWindowBadge({ auction, className }: AuctionWindowBadgeProps) {
    const { t, i18n } = useTranslation();
    const { timeZone } = useRouteContext({ from: "__root__" });
    const { start, end } = auction;
    const formattedDate = (date: Date) => formatShortDate(date, i18n.language, timeZone);

    let badgeText: string;
    if (start && end) {
        badgeText = t("product.auction.range", {
            start: formattedDate(start),
            end: formattedDate(end),
        });
    } else if (start) {
        badgeText = t("product.auction.start", { date: formattedDate(start) });
    } else if (end) {
        badgeText = t("product.auction.end", { date: formattedDate(end) });
    } else {
        return null;
    }

    return (
        <Badge variant="outline" className={cn("py-1 gap-1", className)}>
            <CalendarClock className="size-3 shrink-0" />
            {badgeText}
        </Badge>
    );
}
