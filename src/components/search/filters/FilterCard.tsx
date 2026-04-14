import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { FilterX, ChevronDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ReactNode } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils.ts";

interface FilterCardProps {
    readonly title: string;
    readonly resetTooltip: string;
    readonly onReset: () => void;
    readonly children: ReactNode;
    readonly defaultOpen?: boolean;
    readonly disabled?: boolean;
}

export function FilterCard({
    title,
    resetTooltip,
    onReset,
    children,
    defaultOpen = true,
    disabled = false,
}: FilterCardProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} disabled={disabled}>
            <section className={cn(disabled ? "opacity-55" : "", isOpen ? "pb-4" : "pb-0", "pt-4")}>
                <div className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CollapsibleTrigger asChild disabled={disabled}>
                        <button
                            type="button"
                            className={`flex items-center gap-2 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
                            disabled={disabled}
                        >
                            <h2 className="text-lg font-medium uppercase text-primary-container">
                                {title}
                            </h2>
                            <ChevronDown
                                className={`h-4 w-4 transition-transform duration-200 ${
                                    isOpen ? "rotate-180" : ""
                                }`}
                            />
                        </button>
                    </CollapsibleTrigger>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onReset}
                                className="h-7 w-7 p-0 text-primary/75 hover:bg-primary/8 hover:text-primary"
                                aria-label={resetTooltip}
                                disabled={disabled}
                            >
                                <FilterX className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{resetTooltip}</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
                <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up overflow-y-hidden">
                    <div className="pb-1">{children}</div>
                </CollapsibleContent>
            </section>
        </Collapsible>
    );
}
