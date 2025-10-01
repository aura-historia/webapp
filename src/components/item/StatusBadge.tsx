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
        className: "bg-sky-600 text-white",
    },
    AVAILABLE: {
        label: "Verfügbar",
        className: "bg-green-700 text-white",
    },
    RESERVED: {
        label: "Reserviert",
        className: "bg-amber-600 text-white",
    },
    SOLD: {
        label: "Verkauft",
        className: "bg-amber-600 text-white",
    },
    REMOVED: {
        label: "Gelöscht",
        className: "bg-red-700 text-white",
    },
    UNKNOWN: {
        label: "Unbekannt",
        className: "bg-gray-400 text-white",
    },
} as const;

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const config = statusConfig[status];

    return (
        <Badge variant={"default"} className={cn(config.className, className, "py-1")}>
            {config.label}
        </Badge>
    );
}
