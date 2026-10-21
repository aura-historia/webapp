import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSearchFilterMatchFeedback } from "@/features/saved-searches/api/useSearchFilterMatchFeedback.ts";
import { FOCUS_CLASS } from "@/features/saved-searches/lib/searchFilterStyles.ts";
import { cn } from "@/lib/utils.ts";

type MatchFeedbackButtonsProps = {
    readonly filterId: string;
    readonly productListingId: string;
    readonly currentFeedback?: boolean;
};

const BUTTON_CLASS = cn(
    "inline-flex size-10 cursor-pointer items-center justify-center rounded-pill transition-colors disabled:cursor-not-allowed",
    FOCUS_CLASS,
);

/**
 * The ruled row under a match: whether it is relevant, with a pressed thumb per answer. Pressing
 * the current answer again clears it.
 */
export function MatchFeedbackButtons({
    filterId,
    productListingId,
    currentFeedback,
}: MatchFeedbackButtonsProps) {
    const { t } = useTranslation();
    const { mutate, isPending } = useSearchFilterMatchFeedback(filterId, productListingId);

    let label = t("searchFilters.feedback.question");
    if (currentFeedback === true) label = t("searchFilters.feedback.relevant");
    if (currentFeedback === false) label = t("searchFilters.feedback.notRelevant");

    return (
        <div
            role="group"
            aria-label={t("searchFilters.feedback.groupLabel")}
            className="flex items-center justify-between gap-2 border-t border-line-subtle"
        >
            <span className="font-mono text-tag tracking-[0.14em] text-ink-muted uppercase">
                {label}
            </span>
            <span className="flex gap-1">
                <button
                    type="button"
                    aria-label={t("searchFilters.feedback.relevantHint")}
                    title={t("searchFilters.feedback.relevantHint")}
                    aria-pressed={currentFeedback === true}
                    disabled={isPending}
                    onClick={() => mutate(currentFeedback === true ? null : true)}
                    className={cn(
                        BUTTON_CLASS,
                        currentFeedback === true
                            ? "bg-oxblood text-on-oxblood"
                            : "text-ink hover:enabled:bg-surface-sunken",
                    )}
                >
                    <ThumbsUp aria-hidden="true" className="size-4" strokeWidth={1.7} />
                </button>
                <button
                    type="button"
                    aria-label={t("searchFilters.feedback.notRelevantHint")}
                    title={t("searchFilters.feedback.notRelevantHint")}
                    aria-pressed={currentFeedback === false}
                    disabled={isPending}
                    onClick={() => mutate(currentFeedback === false ? null : false)}
                    className={cn(
                        BUTTON_CLASS,
                        currentFeedback === false
                            ? "bg-ink text-surface"
                            : "text-ink hover:enabled:bg-surface-sunken",
                    )}
                >
                    <ThumbsDown aria-hidden="true" className="size-4" strokeWidth={1.7} />
                </button>
            </span>
        </div>
    );
}
