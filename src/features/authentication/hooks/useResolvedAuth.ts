import { getCurrentUser, signOut as amplifySignOut } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import { useCallback, useEffect, useRef, useState } from "react";

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
    const fetchSequenceRef = useRef(0);

    const fetchUser = useCallback(async () => {
        const requestId = ++fetchSequenceRef.current;
        try {
            const currentUser = await getCurrentUser();
            if (requestId !== fetchSequenceRef.current) {
                return;
            }
            setUser({ userId: currentUser.userId, username: currentUser.username });
        } catch {
            if (requestId !== fetchSequenceRef.current) {
                return;
            }
            setUser(null);
        } finally {
            if (requestId === fetchSequenceRef.current) {
                setIsLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        fetchUser();

        return Hub.listen("auth", ({ payload }) => {
            switch (payload.event) {
                case "signedIn":
                case "signInWithRedirect":
                case "tokenRefresh":
                    fetchUser();
                    break;
                case "signedOut":
                    fetchSequenceRef.current += 1;
                    setUser(null);
                    setIsLoading(false);
                    break;
            }
        });
    }, [fetchUser]);

    const signOut = useCallback(async () => {
        fetchSequenceRef.current += 1;
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
