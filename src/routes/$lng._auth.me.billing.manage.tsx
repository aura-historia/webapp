import { createFileRoute } from "@tanstack/react-router";
import { parseBillingCycle, type BillingCycle } from "@/data/internal/billing/BillingCycle.ts";
import { parseBillingPlan, type BillingPlan } from "@/data/internal/billing/BillingPlan.ts";
import { BillingManagePage } from "@/features/billing/pages/BillingManagePage.tsx";

type BillingManageSearch = {
    plan: BillingPlan;
    cycle: BillingCycle;
};

export const Route = createFileRoute("/$lng/_auth/me/billing/manage")({
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

    return <BillingManagePage plan={plan} cycle={cycle} />;
}
