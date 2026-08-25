import { useEffect, useRef } from "react";
import type { BillingCycle } from "@/data/internal/billing/BillingCycle.ts";
import type { BillingPlan } from "@/data/internal/billing/BillingPlan.ts";
import { useStripeBilling } from "@/features/billing/hooks/useStripeBilling.ts";

type BillingManagePageProps = {
    readonly plan: BillingPlan;
    readonly cycle: BillingCycle;
};

export function BillingManagePage({ plan, cycle }: BillingManagePageProps) {
    const { handleSubscribe, isLoading } = useStripeBilling();
    const hasStartedCheckout = useRef(false);

    useEffect(() => {
        if (hasStartedCheckout.current) return;

        hasStartedCheckout.current = true;
        void handleSubscribe(plan, cycle);
    }, [handleSubscribe, plan, cycle]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            {isLoading && (
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-primary" />
            )}
        </div>
    );
}
