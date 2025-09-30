import { fetchUserAttributes } from "@aws-amplify/auth";
import { useQuery } from "@tanstack/react-query";

export function useUserAttributes() {
    return useQuery({
        queryKey: ["userAttributes"],
        queryFn: fetchUserAttributes,
    });
}
