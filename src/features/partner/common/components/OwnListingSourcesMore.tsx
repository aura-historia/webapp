import { Loader2, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { buttonVariants } from "@/components/ui/button.tsx";
import type { OwnListingSourcesPaging } from "@/features/partner/common/api/useOwnListingSources.ts";
import { cn } from "@/lib/utils.ts";

interface OwnListingSourcesMoreProps {
    readonly listingSources: OwnListingSourcesPaging;
    readonly className?: string;
    readonly textClassName?: string;
    readonly buttonClassName?: string;
}

/** Says that the granted-source list is incomplete and requests its next page on demand. */
export function OwnListingSourcesMore({
    listingSources,
    className,
    textClassName = "text-sm text-muted-foreground",
    buttonClassName = buttonVariants({ variant: "outline", size: "sm" }),
}: OwnListingSourcesMoreProps) {
    const { t } = useTranslation();
    const { hasMore, canLoadMore, isLoadingMore, isLoadMoreError, loadMore } = listingSources;

    if (!hasMore) {
        return null;
    }

    let label = t("ownListingSources.loadMore");
    let icon = null;
    if (isLoadingMore) {
        label = t("ownListingSources.loadingMore");
        icon = <Loader2 aria-hidden="true" className="size-4 animate-spin" />;
    } else if (isLoadMoreError) {
        label = t("ownListingSources.retry");
        icon = <RefreshCw aria-hidden="true" className="size-4" />;
    }

    return (
        <div className={cn("flex flex-col items-start gap-2", className)}>
            {isLoadMoreError ? (
                <p role="alert" className={textClassName}>
                    {t("ownListingSources.loadMoreError")}
                </p>
            ) : (
                <p className={textClassName}>{t("ownListingSources.moreAvailable")}</p>
            )}
            <button
                type="button"
                className={buttonClassName}
                disabled={!canLoadMore}
                aria-busy={isLoadingMore}
                onClick={loadMore}
            >
                {icon}
                {label}
            </button>
        </div>
    );
}
