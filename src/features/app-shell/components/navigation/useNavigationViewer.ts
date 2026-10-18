import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useUserAccount } from "@/features/account-management/hooks/useUserAccount.ts";
import { useResolvedAuth } from "@/features/authentication/hooks/useResolvedAuth.ts";
import { clearViewerScopedQueries } from "@/features/authentication/lib/clearViewerScopedQueries.ts";

export interface NavigationViewer {
    readonly isResolved: boolean;
    readonly isAuthenticated: boolean;
    readonly isAdmin: boolean;
    readonly name: string;
    readonly email: string;
    readonly initials: string;
    /** Current path and search, used as the redirect target of sign-in links. */
    readonly redirect: string;
    readonly signOut: () => Promise<void>;
}

function toInitials(firstName?: string | null, lastName?: string | null): string {
    return `${firstName?.trim()[0] ?? ""}${lastName?.trim()[0] ?? ""}`.toUpperCase();
}

/** Everything the navigation needs to know about the current visitor. */
export function useNavigationViewer(): NavigationViewer {
    const queryClient = useQueryClient();
    const navigate = useNavigate({ from: "/$lng" });
    const redirect = useLocation({
        select: (location) => location.pathname + location.searchStr,
    });
    const { isAuthenticated, isResolved, signOut: amplifySignOut } = useResolvedAuth();
    const { data: userAccount } = useUserAccount();

    const name = [userAccount?.firstName, userAccount?.lastName]
        .map((part) => part?.trim())
        .filter(Boolean)
        .join(" ");

    return {
        isResolved,
        isAuthenticated,
        isAdmin: userAccount?.role === "ADMIN",
        name,
        email: userAccount?.email ?? "",
        initials: toInitials(userAccount?.firstName, userAccount?.lastName),
        redirect,
        signOut: async () => {
            await amplifySignOut();
            clearViewerScopedQueries(queryClient);
            await navigate({ to: "/$lng" });
        },
    };
}
