import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface QualityIndicatorItemProps {
    readonly colorClass: string;
    readonly label: string;
    readonly value: string;
    readonly description?: string;
}

export function ProductQualityIndicatorItem({
    colorClass,
    label,
    value,
    description,
}: QualityIndicatorItemProps) {
    return (
        <div className="grid grid-cols-[minmax(0,10rem)_minmax(0,1fr)] gap-x-6 gap-y-1">
            <span className="text-xs tracking-[0.08em] uppercase text-muted-foreground/80">
                {label}
            </span>
            <div className="flex items-center gap-2">
                <span className={`size-2 rounded-full shrink-0 ${colorClass}`} />
                <span className="text-sm leading-5 text-on-surface font-medium">{value}</span>
                {description && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button type="button" className="shrink-0">
                                    <Info className="size-3.5 text-muted-foreground" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                                <p>{description}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
        </div>
    );
}
