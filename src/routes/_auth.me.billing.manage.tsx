import { useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useStripeBilling } from "@/hooks/billing/useStripeBilling.ts";
import { parseBillingCycle, type BillingCycle } from "@/data/internal/billing/BillingCycle.ts";
import { parseBillingPlan, type BillingPlan } from "@/data/internal/billing/BillingPlan.ts";

type BillingManageSearch = {
    plan: BillingPlan;
    cycle: BillingCycle;
};

export const Route = createFileRoute("/_auth/me/billing/manage")({
    ssr: false,
    validateSearch: (search: Record<string, unknown>): BillingManageSearch => {
        const plan = parseBillingPlan(search.plan);
        const cycle = parseBillingCycle(search.cycle);

        if (!plan) {
            throw new Error("Invalid billing plan");
        }

        if (!cycle) {
            throw new Error("Invalid billing cycle");
        }

        return { plan, cycle };
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
