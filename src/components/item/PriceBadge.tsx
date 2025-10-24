import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp, Tag, XCircle, type LucideIcon } from "lucide-react";
import type { PriceEventType } from "@/types/events";
import { useTranslation } from "react-i18next";

interface PriceBadgeProps {
    readonly eventType: PriceEventType;
    readonly className?: string;
}

const priceEventIconConfig: Record<PriceEventType, { icon: LucideIcon; className: string }> = {
    PRICE_DISCOVERED: {
        icon: Tag,
        className: "bg-blue-700 text-white",
    },
    PRICE_DROPPED: {
        icon: TrendingDown,
        className: "bg-green-700 text-white",
    },
    PRICE_INCREASED: {
        icon: TrendingUp,
        className: "bg-red-700 text-white",
    },
    PRICE_REMOVED: {
        icon: XCircle,
        className: "bg-gray-700 text-white",
    },
};

const priceEventLabelKeys: Record<PriceEventType, string> = {
    PRICE_DISCOVERED: "priceBadge.discovered",
    PRICE_DROPPED: "priceBadge.dropped",
    PRICE_INCREASED: "priceBadge.increased",
    PRICE_REMOVED: "priceBadge.removed",
};

export function PriceBadge({ eventType, className }: PriceBadgeProps) {
    const { t } = useTranslation();
    const config = priceEventIconConfig[eventType];
    const Icon = config.icon;
    const label = t(priceEventLabelKeys[eventType]);

    return (
        <Badge variant="default" className={cn(config.className, className, "py-1 gap-1")}>
            <Icon className="w-3 h-3" />
            {label}
        </Badge>
    );
}
