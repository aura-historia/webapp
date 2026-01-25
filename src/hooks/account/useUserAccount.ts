import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import {
    mapToInternalUserAccount,
    type UserAccountData,
} from "@/data/internal/account/UserAccountData.ts";
import { getUserAccount } from "@/client";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useAuthenticator } from "@aws-amplify/ui-react";

export function useUserAccount(enabled: boolean = true): UseQueryResult<UserAccountData> {
    const { getErrorMessage } = useApiError();
    const { user } = useAuthenticator((context) => [context.user]);

    return useQuery({
        queryKey: ["userAccount"],
        queryFn: async () => {
            const userAccountData = await getUserAccount();

            if (userAccountData.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(userAccountData.error)));
            }

            return mapToInternalUserAccount(userAccountData.data);
        },

        enabled: !!user && enabled,
        retry: false,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
}
