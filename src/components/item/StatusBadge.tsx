import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Clock, HelpCircle, Package, ShoppingCart, Tag, XCircle } from "lucide-react";
import type { ItemState } from "@/data/internal/ItemState.ts";
import { useTranslation } from "react-i18next";

interface StatusBadgeProps {
    readonly status: ItemState;
    readonly className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const { t } = useTranslation();

    const statusConfig = {
        LISTED: {
            label: t("itemState.listed"),
            icon: Tag,
            className: "bg-sky-600 text-white",
        },
        AVAILABLE: {
            label: t("itemState.available"),
            icon: Package,
            className: "bg-green-700 text-white",
        },
        RESERVED: {
            label: t("itemState.reserved"),
            icon: Clock,
            className: "bg-yellow-500 text-white",
        },
        SOLD: {
            label: t("itemState.sold"),
            icon: ShoppingCart,
            className: "bg-amber-600 text-white",
        },
        REMOVED: {
            label: t("itemState.removed"),
            icon: XCircle,
            className: "bg-red-700 text-white",
        },
        UNKNOWN: {
            label: t("itemState.unknown"),
            icon: HelpCircle,
            className: "bg-gray-400 text-white",
        },
    } as const;

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <Badge variant={"default"} className={cn(config.className, className, "py-1 gap-1")}>
            <Icon className="w-3 h-3" />
            {config.label}
        </Badge>
    );
}
