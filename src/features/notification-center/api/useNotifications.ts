import { listNotifications } from "@/client";
import { mapToInternalNotificationCollection } from "@/data/internal/notification/Notification.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { useResolvedAuth } from "@/features/authentication/hooks/useResolvedAuth.ts";

export function useNotifications() {
    const { getErrorMessage } = useApiError();
    const { i18n } = useTranslation();

    const { user, isLoading: isAuthLoading } = useResolvedAuth();

    return useInfiniteQuery({
        queryKey: ["getNotifications", user?.userId ?? "anonymous", i18n.language],
        enabled: !isAuthLoading && Boolean(user),
        queryFn: async ({ pageParam }) => {
            const result = await listNotifications({
                query: {
                    language: parseLanguage(i18n.language),
                    searchAfter: pageParam,
                },
            });

            if (result.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(result.error)));
            }

            return mapToInternalNotificationCollection(result.data);
        },
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage, _pages, _param, pageParams) =>
            lastPage.searchAfter && !pageParams.includes(lastPage.searchAfter)
                ? lastPage.searchAfter
                : undefined,
    });
}
