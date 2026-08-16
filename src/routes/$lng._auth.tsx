import { createFileRoute, redirect } from "@tanstack/react-router";
import { getServerUser } from "@/lib/server/amplify.ts";
import { getCurrentUser } from "aws-amplify/auth";

async function getAuthenticatedUser() {
    if (import.meta.env.SSR) {
        return getServerUser();
    }

    try {
        const user = await getCurrentUser();
        return { user, authenticated: true as const };
    } catch {
        return { user: null, authenticated: false as const };
    }
}

export const Route = createFileRoute("/$lng/_auth")({
    head: () => ({
        meta: [{ name: "robots", content: "noindex, nofollow" }],
    }),
    beforeLoad: async ({ location, params }) => {
        const { user, authenticated } = await getAuthenticatedUser();
        if (!authenticated) {
            throw redirect({
                to: "/$lng/login",
                params: { lng: params.lng },
                search: {
                    redirect: location.href,
                },
            });
        }
        return { user };
    },
});
