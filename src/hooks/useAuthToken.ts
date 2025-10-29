import { fetchAuthSession } from "@aws-amplify/auth";
import { useQuery } from "@tanstack/react-query";
import "@/amplify-config";

export function useAuthToken() {
    return useQuery({
        queryKey: ["authToken"],
        queryFn: async () => {
            try {
                const session = await fetchAuthSession();
                const token = session.tokens?.idToken?.toString();

                if (!token) {
                    console.error("No token found. Session details:", {});
                    throw new Error("No auth token available");
                }
                return token;
            } catch (error) {
                console.error("Error fetching auth token:", error);
                throw error;
            }
        },
        staleTime: 1000 * 60 * 50, // 50 minutes (tokens usually expire after 1 hour)
        retry: 1,
    });
}
