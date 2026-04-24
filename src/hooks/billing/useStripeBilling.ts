import { postBillingManage, postBillingPortal } from "@/client";
import { useAuth } from "@/hooks/auth/useAuth.ts";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useApiError } from "@/hooks/common/useApiError.ts";
import {
    mapToBackendBillingCycle,
    type BillingCycle,
} from "@/data/internal/billing/BillingCycle.ts";
import { mapToBackendBillingPlan, type BillingPlan } from "@/data/internal/billing/BillingPlan.ts";
import { toast } from "sonner";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";

export function useStripeBilling() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { getErrorMessage } = useApiError();
    const [isLoading, setIsLoading] = useState(false);

    const redirectToBillingUrl = async (url: string) => {
        await navigate({ href: url });
    };

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
                await redirectToBillingUrl(billingResponse.data.url);
                return;
            }

            toast.error(getErrorMessage(mapToInternalApiError(billingResponse.error)));
        } finally {
            setIsLoading(false);
        }
    };

    const handleManageSubscription = async () => {
        // Should not happen, since this is ideally only available to signed in users
        if (!user) {
            await navigate({
                to: "/login",
                search: { redirect: "/me/account" },
            });
            return;
        }

        setIsLoading(true);

        try {
            const billingPortalResponse = await postBillingPortal();

            if (billingPortalResponse.data) {
                await redirectToBillingUrl(billingPortalResponse.data.url);
                return;
            }

            toast.error(getErrorMessage(mapToInternalApiError(billingPortalResponse.error)));
        } finally {
            setIsLoading(false);
        }
    };

    return { handleSubscribe, handleManageSubscription, isLoading };
}
