import { getCurrentUser, signOut as amplifySignOut } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import { useCallback, useEffect, useState } from "react";

type AuthUser = {
    userId: string;
    username: string;
};

type UseAuthReturn = {
    user: AuthUser | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
};

/**
 * Shared hook for auth state. Replaces `useAuthenticator` from @aws-amplify/ui-react.
 * Backed directly by aws-amplify/auth primitives and reacts to Hub auth events.
 */
export function useAuth(): UseAuthReturn {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        try {
            const currentUser = await getCurrentUser();
            setUser({ userId: currentUser.userId, username: currentUser.username });
        } catch {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();

        return Hub.listen("auth", ({ payload }) => {
            switch (payload.event) {
                case "signedIn":
                case "tokenRefresh":
                    fetchUser();
                    break;
                case "signedOut":
                    setUser(null);
                    setIsLoading(false);
                    break;
            }
        });
    }, [fetchUser]);

    const signOut = useCallback(async () => {
        await amplifySignOut();
    }, []);

    return { user, isLoading, signOut };
}
