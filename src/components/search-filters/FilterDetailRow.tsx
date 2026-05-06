import { Badge } from "@/components/ui/badge.tsx";
import { Children, type ReactNode } from "react";

type Props = {
    readonly label: string;
    readonly values: string[];
    readonly variant: "text" | "badges";
    readonly badgeVariant?: "outline" | "destructive";
};

/**
 * Labeled row showing filter values — used in SearchFilterCard (text) and SearchFilterWizardConfirmStep (badges).
 * Renders nothing when values is empty.
 */
export function FilterDetailRow({ label, values, variant, badgeVariant = "outline" }: Props) {
    if (!values.length) return null;

    return (
        <div className="flex items-start gap-3">
            <span className="text-xs text-muted-foreground w-32 shrink-0 pt-0.5">{label}</span>
            {variant === "text" ? (
                <span className="text-sm">{values.join(", ")}</span>
            ) : (
                <div className="flex flex-wrap gap-1.5">
                    {values.map((v) => (
                        <Badge
                            key={v}
                            variant={badgeVariant}
                            className={badgeVariant === "destructive" ? "opacity-80" : undefined}
                        >
                            {v}
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}

/**
 * Same layout as FilterDetailRow but accepts custom badge nodes (e.g. StatusBadge, ShopTypeBadge).
 * Renders nothing when children is empty.
 */
export function FilterDetailRowBadges({
    label,
    children,
}: {
    readonly label: string;
    readonly children: ReactNode;
}) {
    if (!Children.count(children)) return null;
    return (
        <div className="flex items-start gap-3">
            <span className="text-xs text-muted-foreground w-32 shrink-0 pt-0.5">{label}</span>
            <div className="flex flex-wrap gap-1.5">{children}</div>
        </div>
    );
}
