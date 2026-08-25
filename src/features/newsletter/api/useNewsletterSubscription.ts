import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import {
    putNewsletterSubscription,
    type PutNewsletterSubscriptionData,
    type PutNewsletterSubscriptionResponse,
} from "@/client";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";

export function useNewsletterSubscription(): UseMutationResult<
    PutNewsletterSubscriptionResponse,
    Error,
    PutNewsletterSubscriptionData
> {
    const { getErrorMessage } = useApiError();

    return useMutation({
        mutationFn: async (subscriptionData: PutNewsletterSubscriptionData) => {
            const response = await putNewsletterSubscription({ body: subscriptionData });

            if (response.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(response.error)));
            }

            return response.data;
        },
    });
}
