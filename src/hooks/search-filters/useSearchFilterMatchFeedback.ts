import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSearchFilterProductMatchFeedback } from "@/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";

export function useSearchFilterMatchFeedback(
    filterId: string,
    shopId: string,
    shopsProductId: string,
) {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();
    const { t } = useTranslation();

    return useMutation({
        mutationFn: async (feedback: boolean) => {
            const result = await updateSearchFilterProductMatchFeedback({
                path: { userSearchFilterId: filterId, shopId, shopsProductId },
                body: { feedback },
            });

            if (result.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(result.error)));
            }

            return result.data;
        },
        onError: (e) => {
            console.error("Error submitting match feedback:", e);
            toast.error(e.message ?? t("searchFilters.feedbackError"));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["searchFilterMatchedProducts", filterId],
            });
        },
    });
}
