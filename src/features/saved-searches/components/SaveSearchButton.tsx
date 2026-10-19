import { Bookmark } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { SEARCH_FILTER_QUOTA } from "@/data/internal/account/SubscriptionType.ts";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import { useUserAccount } from "@/features/account-management/hooks/useUserAccount.ts";
import { useResolvedAuth } from "@/features/authentication/hooks/useResolvedAuth.ts";
import { useUserSearchFilters } from "@/features/saved-searches/api/useUserSearchFilters.ts";
import { SaveSearchFilterDialog } from "@/features/saved-searches/components/SaveSearchFilterDialog.tsx";
import { cn } from "@/lib/utils.ts";

const FOCUS_CLASS =
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass";

type SaveSearchButtonProps = {
    readonly searchArgs: SearchFilterArguments;
    /** `pill`: the ink "Save search" button; `floating`: the round phone button. */
    readonly variant?: "pill" | "floating";
    /** Pill height: 40px in the toolbar, 44px in an empty state. */
    readonly size?: "sm" | "md";
    readonly className?: string;
};

/**
 * Opens the save-search dialog. Disabled, with the reason as a tooltip, for signed-out
 * visitors and members who have used up their saved-search quota.
 */
export function SaveSearchButton({
    searchArgs,
    variant = "pill",
    size = "sm",
    className,
}: SaveSearchButtonProps) {
    const { t } = useTranslation();
    const { isAuthenticated } = useResolvedAuth();
    const { data: account } = useUserAccount();
    const { data: savedFilters } = useUserSearchFilters(isAuthenticated);

    const quotaReached =
        (savedFilters?.total ?? 0) >= SEARCH_FILTER_QUOTA[account?.subscriptionType ?? "free"];
    const disabled = !isAuthenticated || quotaReached;
    let tooltip: string | undefined;
    if (!isAuthenticated) tooltip = t("searchFilter.loginRequired");
    else if (quotaReached) tooltip = t("searchFilter.quotaReached");

    const isFloating = variant === "floating";
    const button = (
        <button
            type="button"
            disabled={disabled}
            aria-label={isFloating ? t("search.saveSearch") : undefined}
            className={cn(
                "inline-flex shrink-0 cursor-pointer items-center justify-center bg-ink text-surface disabled:cursor-not-allowed disabled:opacity-35",
                isFloating
                    ? "size-12 rounded-pill shadow-menu"
                    : cn(
                          "gap-2 rounded-pill px-4 text-sm font-medium",
                          size === "sm" ? "h-10" : "h-11 px-5",
                      ),
                FOCUS_CLASS,
            )}
        >
            <Bookmark
                aria-hidden="true"
                strokeWidth={1.8}
                className={isFloating ? "size-[18px]" : "size-[15px]"}
            />
            {!isFloating && t("search.saveSearch")}
        </button>
    );

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span className={cn("inline-flex", className)}>
                    {disabled ? (
                        button
                    ) : (
                        <SaveSearchFilterDialog searchArgs={searchArgs}>
                            {button}
                        </SaveSearchFilterDialog>
                    )}
                </span>
            </TooltipTrigger>
            {tooltip && (
                <TooltipContent side={isFloating ? "left" : "bottom"} className="max-w-80">
                    {tooltip}
                </TooltipContent>
            )}
        </Tooltip>
    );
}
