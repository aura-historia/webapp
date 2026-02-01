import { Card, CardContent, CardHeader } from "@/components/ui/card.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { Button } from "@/components/ui/button.tsx";
import { FilterX } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ReactNode } from "react";

interface FilterCardProps {
    title: string;
    resetTooltip: string;
    onReset: () => void;
    children: ReactNode;
}

export function FilterCard({ title, resetTooltip, onReset, children }: FilterCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <H2>{title}</H2>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onReset}
                            className="h-8 w-8 p-0"
                            aria-label={resetTooltip}
                        >
                            <FilterX className="h-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{resetTooltip}</p>
                    </TooltipContent>
                </Tooltip>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}
