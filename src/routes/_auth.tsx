import { createFileRoute, redirect } from "@tanstack/react-router";
import { getCurrentUser } from "@aws-amplify/auth";

export const Route = createFileRoute("/_auth")({
    ssr: false,
    beforeLoad: async ({ location }) => {
        try {
            const user = await getCurrentUser();
            return { user };
        } catch {
            throw redirect({
                to: "/login",
                search: {
                    redirect: location.href,
                },
            });
        }
    },
});
