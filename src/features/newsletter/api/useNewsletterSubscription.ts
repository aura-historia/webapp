import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { putNewsletterSubscription } from "@/client";
import {
    type NewsletterSubscription,
    mapToBackendNewsletterSubscription,
} from "@/data/internal/account/NewsletterSubscription.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";

export function useNewsletterSubscription(): UseMutationResult<
    void,
    Error,
    NewsletterSubscription
> {
    const { getErrorMessage } = useApiError();

    return useMutation({
        mutationFn: async (subscriptionData: NewsletterSubscription) => {
            const response = await putNewsletterSubscription({
                body: mapToBackendNewsletterSubscription(subscriptionData),
            });

            if (response.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(response.error)));
            }
        },
    });
}
