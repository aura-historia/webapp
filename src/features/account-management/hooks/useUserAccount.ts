import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import {
    mapToInternalUserAccount,
    type UserAccountData,
} from "@/data/internal/account/UserAccountData.ts";
import { getUserAccount } from "@/client";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useResolvedAuth } from "@/features/authentication/hooks/useResolvedAuth.ts";
import { USER_ACCOUNT_QUERY_KEY } from "@/features/account-management/api/accountQueryKeys.ts";

export function useUserAccount(enabled: boolean = true): UseQueryResult<UserAccountData> {
    const { getErrorMessage } = useApiError();
    const { isAuthenticated } = useResolvedAuth();

    return useQuery({
        queryKey: USER_ACCOUNT_QUERY_KEY,
        queryFn: async () => {
            const userAccountData = await getUserAccount();

            if (userAccountData.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(userAccountData.error)));
            }

            return mapToInternalUserAccount(userAccountData.data);
        },

        enabled: isAuthenticated && enabled,
        retry: false,
        staleTime: 0,
        gcTime: 10 * 60 * 1000,
    });
}
