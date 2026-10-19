import { Link } from "@tanstack/react-router";
import { ChevronDown, Lock, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils.ts";

/** Brass focus ring shared by the filter controls. */
export const FILTER_FOCUS_CLASS =
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass";

type FilterCardProps = {
    readonly title: string;
    readonly resetTooltip?: string;
    readonly onReset?: () => void;
    /** Shows the reset button; a filter at its default has nothing to reset. */
    readonly active?: boolean;
    /** Short mono value beside the title, e.g. "7 OF 11" or "€800–€6,000". */
    readonly summary?: ReactNode;
    readonly children: ReactNode;
    readonly defaultOpen?: boolean;
    readonly disabled?: boolean;
};

/** One collapsible group of the filter panel: mono heading between hairlines, then its controls. */
export function FilterCard({
    title,
    resetTooltip,
    onReset,
    active = false,
    summary,
    children,
    defaultOpen = true,
    disabled = false,
}: FilterCardProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const { t } = useTranslation();
    const headingId = useId();

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} disabled={disabled}>
            <section aria-labelledby={headingId} className="border-t border-line">
                <div className="flex items-center gap-1">
                    <CollapsibleTrigger asChild disabled={disabled}>
                        <button
                            type="button"
                            id={headingId}
                            disabled={disabled}
                            className={cn(
                                "group flex min-h-13 flex-1 cursor-pointer items-center gap-2.5 text-left disabled:cursor-not-allowed",
                                disabled && "opacity-55",
                                FILTER_FOCUS_CLASS,
                            )}
                        >
                            <span className="font-mono text-label text-ink-muted uppercase group-hover:text-ink">
                                {title}
                            </span>
                            {summary && (
                                <span className="min-w-0 truncate font-mono text-tag text-ink uppercase">
                                    {summary}
                                </span>
                            )}
                            <ChevronDown
                                aria-hidden="true"
                                strokeWidth={1.8}
                                className={cn(
                                    "ml-auto size-4 shrink-0 text-ink-muted transition-transform duration-200",
                                    isOpen && "rotate-180",
                                )}
                            />
                        </button>
                    </CollapsibleTrigger>
                    {disabled && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="inline-flex shrink-0 cursor-pointer">
                                    <Lock aria-hidden="true" className="size-3.5 text-ink-muted" />
                                    <span className="sr-only">
                                        {t("searchFilter.upgradeRequired")}
                                    </span>
                                </span>
                            </TooltipTrigger>
                            <TooltipContent className="flex max-w-56 flex-col gap-1 text-center">
                                <span>{t("searchFilter.upgradeRequired")}</span>
                                <Link
                                    to="/$lng"
                                    hash="pricing"
                                    className="font-medium underline underline-offset-2"
                                    onClick={(e) => e.stopPropagation()}
                                    params={true}
                                    from="/$lng"
                                >
                                    {t("searchFilter.upgradeNow")}
                                </Link>
                            </TooltipContent>
                        </Tooltip>
                    )}
                    {onReset && active && !disabled && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    onClick={onReset}
                                    aria-label={resetTooltip}
                                    className={cn(
                                        "inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-pill text-ink-muted hover:text-ink",
                                        FILTER_FOCUS_CLASS,
                                    )}
                                >
                                    <RotateCcw
                                        aria-hidden="true"
                                        className="size-[15px]"
                                        strokeWidth={1.8}
                                    />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>{resetTooltip}</TooltipContent>
                        </Tooltip>
                    )}
                </div>
                <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                    <div
                        className={cn(
                            "pb-5",
                            disabled && "pointer-events-none opacity-55 select-none",
                        )}
                    >
                        {children}
                    </div>
                </CollapsibleContent>
            </section>
        </Collapsible>
    );
}
