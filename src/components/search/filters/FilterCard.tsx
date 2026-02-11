import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { H2 } from "@/components/typography/H2";
import { Button } from "@/components/ui/button";
import { FilterX, ChevronDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ReactNode } from "react";
import { useState } from "react";

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
            <Card className={disabled ? "opacity-50" : undefined}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    {" "}
                    <CollapsibleTrigger asChild disabled={disabled}>
                        <button
                            type="button"
                            className={`flex items-center gap-2 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
                            disabled={disabled}
                        >
                            <H2>{title}</H2>
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
                                className="h-8 w-8 p-0"
                                aria-label={resetTooltip}
                                disabled={disabled}
                            >
                                <FilterX className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{resetTooltip}</p>
                        </TooltipContent>
                    </Tooltip>
                </CardHeader>
                <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                    <CardContent>{children}</CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
}
