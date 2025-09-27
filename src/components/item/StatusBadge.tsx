import { Badge } from "@/components/ui/badge";
import type { ItemState } from "@/data/internal/ItemState";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
    readonly status: ItemState;
    readonly className?: string;
}

const statusConfig = {
    LISTED: {
        label: "Gelistet",
        variant: "default" as const,
        className: "bg-sky-600 text-white",
    },
    AVAILABLE: {
        label: "Verfügbar",
        variant: "default" as const,
        className: "bg-green-700 text-white",
    },
    RESERVED: {
        label: "Reserviert",
        variant: "secondary" as const,
        className: "bg-amber-600 text-white",
    },
    SOLD: {
        label: "Verkauft",
        variant: "outline" as const,
        className: "bg-amber-600 text-white",
    },
    REMOVED: {
        label: "Gelöscht",
        variant: "destructive" as const,
        className: "bg-red-700 text-white",
    },
    UNKNOWN: {
        label: "Unbekannt",
        variant: "secondary" as const,
        className: "bg-gray-100 text-foreground",
    },
} as const;

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const config = statusConfig[status];

    return (
        <Badge variant={config.variant} className={cn(config.className, className, "py-1")}>
            {config.label}
        </Badge>
    );
}
