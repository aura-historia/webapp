import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Spinner } from "@/components/ui/spinner";
import { SUBSCRIPTION_TYPE_TRANSLATION_KEYS } from "@/data/internal/account/SubscriptionType.ts";
import { useUserAccount } from "@/features/account-management/hooks/useUserAccount.ts";
import {
    CARD_CLASS,
    GROUP_LABEL_CLASS,
    SECONDARY_BUTTON_CLASS,
} from "@/features/account-management/lib/accountStyles.ts";
import { useStripeBilling } from "@/features/billing/hooks/useStripeBilling";
import { cn } from "@/lib/utils.ts";

export function SubscriptionPlanSection() {
    const { t } = useTranslation();
    const { data: userAccount } = useUserAccount();
    const { handleSubscribe, isLoading } = useStripeBilling();

    const subscriptionType = userAccount?.subscriptionType ?? "free";
    const planName = t(SUBSCRIPTION_TYPE_TRANSLATION_KEYS[subscriptionType]);

    return (
        <div
            className={cn(
                CARD_CLASS,
                "flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between",
            )}
        >
            <div className="flex min-w-0 flex-col gap-1.5">
                <span className={GROUP_LABEL_CLASS}>
                    {t("account.subscription.currentPlanLabel")}
                </span>
                <span className="font-serif text-title-lg font-normal tracking-[-0.01em]">
                    {planName}
                </span>
            </div>
            <button
                type="button"
                className={cn(SECONDARY_BUTTON_CLASS, "shrink-0")}
                onClick={() => void handleSubscribe("PRO", "YEARLY")}
                disabled={isLoading}
            >
                {isLoading && <Spinner aria-hidden="true" />}
                {t("account.subscription.manageButton")}
                {!isLoading && (
                    <ArrowUpRight aria-hidden="true" className="size-4" strokeWidth={1.8} />
                )}
            </button>
        </div>
    );
}
