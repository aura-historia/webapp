import type { LucideIcon } from "lucide-react";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface QualityIndicatorItemProps {
    readonly icon: LucideIcon;
    readonly colorClass: string;
    readonly label: string;
    readonly value: string;
    readonly description?: string;
}

export function ProductQualityIndicatorItem({
    icon: Icon,
    colorClass,
    label,
    value,
    description,
}: QualityIndicatorItemProps) {
    return (
        <div className="flex items-start gap-3">
            <div className={`flex items-center justify-center size-10 rounded-full ${colorClass}`}>
                <Icon className="size-5 text-white" />
            </div>
            <div className="flex flex-col gap-0.5">
                <span className="text-base font-semibold text-muted-foreground">{label}</span>
                <div className="flex items-center gap-1.5">
                    <span className="text-lg font-bold">{value}</span>
                    {description && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="size-4" />
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs">
                                    <p>{description}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            </div>
        </div>
    );
}
