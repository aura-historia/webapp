import { postBillingManage } from "@/client";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import {
    mapToBackendBillingCycle,
    type BillingCycle,
} from "@/data/internal/billing/BillingCycle.ts";
import { mapToBackendBillingPlan, type BillingPlan } from "@/data/internal/billing/BillingPlan.ts";

export function useStripeBilling() {
    const { user } = useAuthenticator((context) => [context.user]);
    const navigate = useNavigate();
    const { getErrorMessage } = useApiError();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubscribe = async (plan: BillingPlan, cycle: BillingCycle) => {
        if (!user) {
            const billingSearch = new URLSearchParams({ plan, cycle });
            await navigate({
                to: "/login",
                search: { redirect: `/me/billing/manage?${billingSearch.toString()}` },
            });
            return;
        }

        setIsLoading(true);

        try {
            const billingResponse = await postBillingManage({
                body: {
                    plan: mapToBackendBillingPlan(plan),
                    cycle: mapToBackendBillingCycle(cycle),
                },
            });

            if (billingResponse.data) {
                await navigate({ href: billingResponse.data.url });
                return;
            }

            toast.error(getErrorMessage(mapToInternalApiError(billingResponse.error)));
        } finally {
            setIsLoading(false);
        }
    };

    return { handleSubscribe, isLoading };
}
