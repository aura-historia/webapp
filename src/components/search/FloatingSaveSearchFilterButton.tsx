import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { BookmarkPlus } from "lucide-react";
import { SaveSearchFilterDialog } from "@/components/search/SaveSearchFilterDialog.tsx";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";

type Props = {
    readonly searchArgs: SearchFilterArguments;
    readonly disabled?: boolean;
    readonly tooltip?: string;
};

export function FloatingSaveSearchFilterButton({ searchArgs, disabled, tooltip }: Props) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => setVisible(globalThis.scrollY > 300);
        globalThis.addEventListener("scroll", handleScroll);
        return () => globalThis.removeEventListener("scroll", handleScroll);
    }, []);

    if (!visible) return null;

    const button = (
        <Button
            type="button"
            size="icon"
            variant="outline"
            disabled={disabled}
            className="rounded-full w-12 h-12 shadow-lg border-outline-variant text-primary hover:bg-primary/8"
        >
            <BookmarkPlus className="h-5 w-5" />
        </Button>
    );

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span className="fixed bottom-24 right-8 z-50">
                    {disabled ? (
                        button
                    ) : (
                        <SaveSearchFilterDialog searchArgs={searchArgs}>
                            {button}
                        </SaveSearchFilterDialog>
                    )}
                </span>
            </TooltipTrigger>
            {tooltip && <TooltipContent side="left">{tooltip}</TooltipContent>}
        </Tooltip>
    );
}
