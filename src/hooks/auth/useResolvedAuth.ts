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

function useAuth(): UseAuthReturn {
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
        setUser(null);
        setIsLoading(false);
        await amplifySignOut();
    }, []);

    return { user, isLoading, signOut };
}

export function useResolvedAuth() {
    const { user, isLoading, signOut } = useAuth();
    const isAuthenticated = !isLoading && !!user;

    return {
        user,
        isAuthenticated,
        isLoading,
        isResolved: !isLoading,
        signOut,
    };
}
