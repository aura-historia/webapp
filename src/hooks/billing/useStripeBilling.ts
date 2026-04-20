import { postBillingCheckout, postBillingPortal } from "@/client";
import type { BillingCycleData, BillingPlanData } from "@/client";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";

const STRIPE_CUSTOMER_ALREADY_EXISTS_STATUS = 409;

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
            const checkoutResponse = await postBillingCheckout({
                body: { plan, cycle },
            });

            if (checkoutResponse.data) {
                window.location.href = checkoutResponse.data.url;
                return;
            }

            if (checkoutResponse.error?.status === STRIPE_CUSTOMER_ALREADY_EXISTS_STATUS) {
                const portalResponse = await postBillingPortal();

                if (portalResponse.data) {
                    window.location.href = portalResponse.data.url;
                    return;
                }

                toast.error(getErrorMessage(mapToInternalApiError(portalResponse.error)));
                return;
            }

            toast.error(getErrorMessage(mapToInternalApiError(checkoutResponse.error)));
        } finally {
            setIsLoading(false);
        }
    };

    return { handleSubscribe, isLoading };
}
