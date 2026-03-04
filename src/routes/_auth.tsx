import { createFileRoute, redirect } from "@tanstack/react-router";
import { getServerUser } from "@/lib/server/amplify.ts";

export const Route = createFileRoute("/_auth")({
    head: () => ({
        meta: [{ name: "robots", content: "noindex, nofollow" }],
    }),
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
