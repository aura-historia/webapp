import { postBillingManage } from "@/client";
import type { BillingCycleData, BillingPlanData } from "@/client";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";

export function useStripeBilling() {
    const { user } = useAuthenticator((context) => [context.user]);
    const navigate = useNavigate();
    const { getErrorMessage } = useApiError();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubscribe = async (plan: BillingPlanData, cycle: BillingCycleData) => {
        if (!user) {
            navigate({ to: "/login", search: { redirect: "/" } });
            return;
        }

        setIsLoading(true);

        try {
            const billingResponse = await postBillingManage({
                body: { plan, cycle },
            });

            if (billingResponse.data) {
                window.location.href = billingResponse.data.url;
                return;
            }

            toast.error(getErrorMessage(mapToInternalApiError(billingResponse.error)));
        } finally {
            setIsLoading(false);
        }
    };

    return { handleSubscribe, isLoading };
}
