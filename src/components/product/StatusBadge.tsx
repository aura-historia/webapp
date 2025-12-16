import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Clock, HelpCircle, Package, ShoppingCart, Tag, XCircle } from "lucide-react";
import type { ProductState } from "@/data/internal/ProductState.ts";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { useMemo } from "react";

interface StatusBadgeProps {
    readonly status: ProductState;
    readonly className?: string;
}

const createStatusBadge = (t: TFunction) => {
    return {
        LISTED: {
            label: t("productState.listed"),
            icon: Tag,
            className: "bg-sky-600 text-white",
        },
        AVAILABLE: {
            label: t("productState.available"),
            icon: Package,
            className: "bg-green-700 text-white",
        },
        RESERVED: {
            label: t("productState.reserved"),
            icon: Clock,
            className: "bg-yellow-500 text-white",
        },
        SOLD: {
            label: t("productState.sold"),
            icon: ShoppingCart,
            className: "bg-amber-600 text-white",
        },
        REMOVED: {
            label: t("productState.removed"),
            icon: XCircle,
            className: "bg-red-700 text-white",
        },
        UNKNOWN: {
            label: t("productState.unknown"),
            icon: HelpCircle,
            className: "bg-gray-400 text-white",
        },
    } as const;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const { t } = useTranslation();

    const statusConfig = useMemo(() => createStatusBadge(t), [t]);

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <Badge variant={"default"} className={cn(config.className, className, "py-1 gap-1")}>
            <Icon className="w-3 h-3" />
            {config.label}
        </Badge>
    );
}
