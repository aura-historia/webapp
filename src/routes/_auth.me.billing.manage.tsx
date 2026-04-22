import { useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import type { BillingCycleData, BillingPlanData } from "@/client";
import { useStripeBilling } from "@/hooks/billing/useStripeBilling.ts";

type BillingManageSearch = {
    plan: BillingPlanData;
    cycle: BillingCycleData;
};

const BILLING_PLANS: BillingPlanData[] = ["PRO", "ULTIMATE"];
const BILLING_CYCLES: BillingCycleData[] = ["MONTHLY", "YEARLY"];

export const Route = createFileRoute("/_auth/me/billing/manage")({
    ssr: false,
    validateSearch: (search: Record<string, unknown>): BillingManageSearch => {
        const plan = typeof search.plan === "string" ? search.plan : undefined;
        const cycle = typeof search.cycle === "string" ? search.cycle : undefined;

        if (!plan || !BILLING_PLANS.includes(plan as BillingPlanData)) {
            throw new Error("Invalid billing plan");
        }

        if (!cycle || !BILLING_CYCLES.includes(cycle as BillingCycleData)) {
            throw new Error("Invalid billing cycle");
        }

        return {
            plan: plan as BillingPlanData,
            cycle: cycle as BillingCycleData,
        };
    },
    component: BillingManageRoute,
});

function BillingManageRoute() {
    const { plan, cycle } = Route.useSearch();
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
