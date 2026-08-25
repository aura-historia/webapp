import { Badge } from "@/components/ui/badge.tsx";
import { cn } from "@/lib/utils.ts";
import { Clock, HelpCircle, Package, ShoppingCart, Tag, XCircle } from "lucide-react";
import type { ProductState } from "@/data/internal/product/ProductState.ts";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { useMemo } from "react";

interface StatusBadgeProps {
    readonly status: ProductState;
    readonly className?: string;
    readonly variant?: "default" | "editorial";
    readonly showIcon?: boolean;
}

const createStatusBadge = (t: TFunction) => {
    return {
        LISTED: {
            label: t("productState.listed"),
            icon: Tag,
            className: "bg-secondary-container text-on-secondary-container",
        },
        AVAILABLE: {
            label: t("productState.available"),
            icon: Package,
            className: "bg-tertiary-fixed text-on-surface",
        },
        RESERVED: {
            label: t("productState.reserved"),
            icon: Clock,
            className: "bg-surface-container-high text-on-surface-variant",
        },
        SOLD: {
            label: t("productState.sold"),
            icon: ShoppingCart,
            className: "bg-surface-container-highest text-on-surface-variant",
        },
        REMOVED: {
            label: t("productState.removed"),
            icon: XCircle,
            className: "border-destructive/60 bg-destructive/20 text-destructive",
        },
        UNKNOWN: {
            label: t("productState.unknown"),
            icon: HelpCircle,
            className: "bg-surface-container text-on-surface-variant",
        },
    } as const;
};

export function StatusBadge({
    status,
    className,
    variant = "default",
    showIcon = true,
}: StatusBadgeProps) {
    const { t } = useTranslation();

    const statusConfig = useMemo(() => createStatusBadge(t), [t]);

    const config = statusConfig[status];
    const Icon = config.icon;
    const baseClass =
        variant === "editorial"
            ? "rounded-none border border-outline-variant/20 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em]"
            : "rounded-none border border-outline-variant/20 px-2 py-1 text-xs font-medium";

    return (
        <Badge variant="outline" className={cn(baseClass, config.className, className, "gap-1")}>
            {showIcon && <Icon className="size-3" />}
            {config.label}
        </Badge>
    );
}
