import { Badge } from "@/components/ui/badge";
import type { ItemState } from "@/data/internal/ItemState";
import { cn } from "@/lib/utils";
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
            className: "bg-sky-600 text-white",
        },
        AVAILABLE: {
            label: t("itemState.available"),
            className: "bg-green-700 text-white",
        },
        RESERVED: {
            label: t("itemState.reserved"),
            className: "bg-yellow-500 text-white",
        },
        SOLD: {
            label: t("itemState.sold"),
            className: "bg-amber-600 text-white",
        },
        REMOVED: {
            label: t("itemState.removed"),
            className: "bg-red-700 text-white",
        },
        UNKNOWN: {
            label: t("itemState.unknown"),
            className: "bg-gray-400 text-white",
        },
    } as const;
    const config = statusConfig[status];

    return (
        <Badge variant={"default"} className={cn(config.className, className, "py-1")}>
            {config.label}
        </Badge>
    );
}
