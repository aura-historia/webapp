import { H2 } from "@/components/typography/H2";
import { Button } from "@/components/ui/button";
import { useUserAccount } from "@/hooks/account/useUserAccount";
import { useTranslation } from "react-i18next";
import { SUBSCRIPTION_TYPE_TRANSLATION_KEYS } from "@/data/internal/account/SubscriptionType.ts";

export function SubscriptionPlanSection() {
    const { t } = useTranslation();
    const { data: userAccount } = useUserAccount();

    const subscriptionType = userAccount?.subscriptionType ?? "free";
    const planName = t(SUBSCRIPTION_TYPE_TRANSLATION_KEYS[subscriptionType]);

    return (
        <section className="flex flex-col gap-6">
            <H2>{t("account.subscription.title")}</H2>
            <div className="bg-background text-card-foreground rounded-sm border p-6 shadow-sm md:p-10">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <p className="text-muted-foreground text-sm">
                            {t("account.subscription.currentPlanLabel")}
                        </p>
                        <p className="text-xl font-semibold md:text-2xl">{planName}</p>
                    </div>
                    <Button type="button" className="w-full md:w-auto">
                        {t("account.subscription.manageButton")}
                    </Button>
                </div>
            </div>
        </section>
    );
}
