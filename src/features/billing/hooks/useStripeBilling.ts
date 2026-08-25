import { postBillingManage } from "@/client";
import { useResolvedAuth } from "@/features/authentication/hooks/useResolvedAuth.ts";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { useApiError } from "@/hooks/common/useApiError.ts";
import {
    mapToBackendBillingCycle,
    type BillingCycle,
} from "@/data/internal/billing/BillingCycle.ts";
import { mapToBackendBillingPlan, type BillingPlan } from "@/data/internal/billing/BillingPlan.ts";
import { toast } from "sonner";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { localizeHref } from "@/i18n/routing.ts";

export function useStripeBilling() {
    const { isAuthenticated } = useResolvedAuth();
    const navigate = useNavigate({ from: "/$lng" });
    const { lng } = useParams({ from: "/$lng" });
    const { getErrorMessage } = useApiError();
    const [isLoading, setIsLoading] = useState(false);

    const redirectToBillingUrl = async (url: string) => {
        await navigate({ href: url });
    };

    const handleSubscribe = async (plan: BillingPlan, cycle: BillingCycle) => {
        if (!isAuthenticated) {
            const billingSearch = new URLSearchParams({ plan, cycle });
            await navigate({
                to: "/$lng/login",
                search: {
                    redirect: localizeHref(`/me/billing/manage?${billingSearch.toString()}`, lng),
                },
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

    return { handleSubscribe, isLoading };
}
