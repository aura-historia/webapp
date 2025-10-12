import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp, Tag, XCircle } from "lucide-react";
import type { PriceEventTypeData } from "@/types/events.ts";

interface PriceBadgeProps {
    readonly eventType: PriceEventTypeData;
    readonly className?: string;
}

const priceEventConfig = {
    PRICE_DISCOVERED: {
        label: "Preis entdeckt",
        icon: Tag,
        className: "bg-blue-700 text-white",
    },
    PRICE_DROPPED: {
        label: "Preis gesunken",
        icon: TrendingDown,
        className: "bg-green-700 text-white",
    },
    PRICE_INCREASED: {
        label: "Preis gestiegen",
        icon: TrendingUp,
        className: "bg-red-700 text-white",
    },
    PRICE_REMOVED: {
        label: "Preis entfernt",
        icon: XCircle,
        className: "bg-gray-700 text-white",
    },
} as const;

export function PriceBadge({ eventType, className }: PriceBadgeProps) {
    const config = priceEventConfig[eventType];
    const Icon = config.icon;

    return (
        <Badge variant="default" className={cn(config.className, className, "py-1 gap-1")}>
            <Icon className="w-3 h-3" />
            {config.label}
        </Badge>
    );
}
