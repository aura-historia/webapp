import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp, Tag, XCircle } from "lucide-react";
import type { PriceEventType } from "@/types/events";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { useMemo } from "react";

interface PriceBadgeProps {
    readonly eventType: PriceEventType;
    readonly className?: string;
}

const createPriceEventIconConfig = (t: TFunction) => {
    return {
        PRICE_DISCOVERED: {
            label: t("priceBadge.discovered"),
            icon: Tag,
            className: "bg-blue-700 text-white",
        },
        PRICE_DROPPED: {
            label: t("priceBadge.dropped"),
            icon: TrendingDown,
            className: "bg-green-700 text-white",
        },
        PRICE_INCREASED: {
            label: t("priceBadge.increased"),
            icon: TrendingUp,
            className: "bg-red-700 text-white",
        },
        PRICE_REMOVED: {
            label: t("priceBadge.removed"),
            icon: XCircle,
            className: "bg-gray-700 text-white",
        },
    } as const;
};

export function PriceBadge({ eventType, className }: PriceBadgeProps) {
    const { t } = useTranslation();

    const priceEventIconConfig = useMemo(() => createPriceEventIconConfig(t), [t]);

    const config = priceEventIconConfig[eventType];
    const Icon = config.icon;

    return (
        <Badge variant="default" className={cn(config.className, className, "py-1 gap-1")}>
            <Icon className="w-3 h-3" />
            {config.label}
        </Badge>
    );
}
