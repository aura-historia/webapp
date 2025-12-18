import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { mapToInternalUserAccount, type UserAccountData } from "@/data/internal/UserAccountData.ts";
import { getUserAccount } from "@/client";
import { useApiError } from "@/hooks/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/ApiError.ts";

export function useUserAccount(): UseQueryResult<UserAccountData> {
    const { getErrorMessage } = useApiError();

    return useQuery({
        queryKey: ["userAccount"],
        queryFn: async () => {
            const userAccountData = await getUserAccount();

            if (userAccountData.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(userAccountData.error)));
            }

            return mapToInternalUserAccount(userAccountData.data);
        },

        enabled: true,
        retry: false,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
}
