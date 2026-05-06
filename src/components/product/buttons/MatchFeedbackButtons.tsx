import { ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { useSearchFilterMatchFeedback } from "@/hooks/search-filters/useSearchFilterMatchFeedback.ts";
import { cn } from "@/lib/utils.ts";
import { useTranslation } from "react-i18next";
import type { ComponentType, SVGProps } from "react";

interface MatchFeedbackButtonsProps {
    readonly filterId: string;
    readonly shopId: string;
    readonly shopsProductId: string;
    readonly currentFeedback?: boolean;
}

interface FeedbackButtonProps {
    readonly icon: ComponentType<SVGProps<SVGSVGElement>>;
    readonly tooltip: string;
    readonly active: boolean;
    readonly activeClass: string;
    readonly disabled: boolean;
    readonly onClick: () => void;
}

function FeedbackButton({
    icon: Icon,
    tooltip,
    active,
    activeClass,
    disabled,
    onClick,
}: FeedbackButtonProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" disabled={disabled} onClick={onClick}>
                    <Icon
                        className={cn(
                            "size-4 transition-colors duration-200",
                            active && activeClass,
                        )}
                    />
                </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{tooltip}</TooltipContent>
        </Tooltip>
    );
}

export function MatchFeedbackButtons({
    filterId,
    shopId,
    shopsProductId,
    currentFeedback,
}: MatchFeedbackButtonsProps) {
    const { t } = useTranslation();
    const { mutate, isPending } = useSearchFilterMatchFeedback(filterId, shopId, shopsProductId);

    return (
        <div className="flex items-center gap-1">
            <FeedbackButton
                icon={ThumbsUp}
                tooltip={t("searchFilters.feedback.relevantHint")}
                active={currentFeedback === true}
                activeClass="fill-primary text-primary"
                disabled={isPending}
                onClick={() => mutate(true)}
            />
            <FeedbackButton
                icon={ThumbsDown}
                tooltip={t("searchFilters.feedback.notRelevantHint")}
                active={currentFeedback === false}
                activeClass="fill-destructive text-destructive"
                disabled={isPending}
                onClick={() => mutate(false)}
            />
        </div>
    );
}
