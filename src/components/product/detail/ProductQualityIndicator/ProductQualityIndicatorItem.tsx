import type { LucideIcon } from "lucide-react";

interface QualityIndicatorItemProps {
    readonly icon: LucideIcon;
    readonly colorClass: string;
    readonly label: string;
    readonly value: string;
}

export function ProductQualityIndicatorItem({
    icon: Icon,
    colorClass,
    label,
    value,
}: QualityIndicatorItemProps) {
    return (
        <div className="flex items-start gap-3">
            <div className={`flex items-center justify-center size-10 rounded-full ${colorClass}`}>
                <Icon className="size-5 text-white" />
            </div>
            <div className="flex flex-col gap-0.5">
                <span className="text-base font-semibold text-muted-foreground">{label}</span>
                <span className="text-lg font-bold">{value}</span>
            </div>
        </div>
    );
}
