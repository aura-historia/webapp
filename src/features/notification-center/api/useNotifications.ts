import { getNotifications } from "@/client";
import { mapToInternalNotificationCollection } from "@/data/internal/notification/Notification.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

const PAGE_SIZE = 20;

export function useNotifications() {
    const { getErrorMessage } = useApiError();
    const { i18n } = useTranslation();

    return useInfiniteQuery({
        queryKey: ["getNotifications", i18n.language],
        queryFn: async ({ pageParam }) => {
            const result = await getNotifications({
                query: {
                    language: parseLanguage(i18n.language),
                    searchAfter: pageParam,
                    size: PAGE_SIZE,
                },
            });

            if (result.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(result.error)));
            }

            return mapToInternalNotificationCollection(result.data);
        },
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.searchAfter ?? undefined,
    });
}
