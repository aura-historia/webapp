import { createFileRoute, redirect } from "@tanstack/react-router";
import { getServerUser } from "@/lib/server/amplify.server";

export const Route = createFileRoute("/_auth")({
    beforeLoad: async ({ location }) => {
        const { user, authenticated } = await getServerUser();
        if (!authenticated) {
            throw redirect({
                to: "/login",
                search: {
                    redirect: location.href,
                },
            });
        }
        return { user };
    },
});
