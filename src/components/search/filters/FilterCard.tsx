import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { FilterX, ChevronDown, Lock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ReactNode } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils.ts";
import { useTranslation } from "react-i18next";

const PRICING_HREF = "/#pricing";

interface FilterCardProps {
    readonly title: string;
    readonly resetTooltip?: string;
    readonly onReset?: () => void;
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
    const { t } = useTranslation();

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} disabled={disabled}>
            <section className={cn(isOpen ? "pb-4" : "pb-0", "pt-4")}>
                <div className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <div className="flex items-center gap-2">
                        <div className={cn("flex items-center gap-2", disabled && "opacity-55")}>
                            <CollapsibleTrigger asChild disabled={disabled}>
                                <button
                                    type="button"
                                    className={`flex items-center gap-2 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
                                    disabled={disabled}
                                >
                                    <h2 className="text-lg tracking-tighter font-medium font-display uppercase text-primary-container">
                                        {title}
                                    </h2>
                                    <ChevronDown
                                        className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                                    />
                                </button>
                            </CollapsibleTrigger>
                        </div>
                        {disabled && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="cursor-pointer shrink-0 inline-flex">
                                        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent className="flex flex-col gap-1 max-w-56 text-center">
                                    <span>{t("searchFilter.upgradeRequired")}</span>
                                    <a
                                        href={PRICING_HREF}
                                        className="text-primary underline underline-offset-2 font-medium"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {t("searchFilter.upgradeNow")}
                                    </a>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                    <div className={cn(disabled && "opacity-55")}>
                        {onReset && (
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
                        )}
                    </div>
                </div>
                <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up overflow-y-hidden">
                    <div
                        className={cn(
                            "pb-1",
                            disabled && "opacity-55 pointer-events-none select-none",
                        )}
                    >
                        {children}
                    </div>
                </CollapsibleContent>
            </section>
        </Collapsible>
    );
}
