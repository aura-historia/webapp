import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Clock, HelpCircle, Package, ShoppingCart, Tag, XCircle } from "lucide-react";
import type { ItemState } from "@/data/internal/ItemState.ts";

interface StatusBadgeProps {
    readonly status: ItemState;
    readonly className?: string;
}

const statusConfig = {
    LISTED: {
        label: "Gelistet",
        icon: Tag,
        className: "bg-sky-600 text-white",
    },
    AVAILABLE: {
        label: "Verfügbar",
        icon: Package,
        className: "bg-green-700 text-white",
    },
    RESERVED: {
        label: "Reserviert",
        icon: Clock,
        className: "bg-yellow-500 text-white",
    },
    SOLD: {
        label: "Verkauft",
        icon: ShoppingCart,
        className: "bg-amber-600 text-white",
    },
    REMOVED: {
        label: "Gelöscht",
        icon: XCircle,
        className: "bg-red-700 text-white",
    },
    UNKNOWN: {
        label: "Unbekannt",
        icon: HelpCircle,
        className: "bg-gray-400 text-white",
    },
} as const;

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <Badge variant={"default"} className={cn(config.className, className, "py-1 gap-1")}>
            <Icon className="w-3 h-3" />
            {config.label}
        </Badge>
    );
}
