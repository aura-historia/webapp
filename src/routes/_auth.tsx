import { createFileRoute, redirect } from "@tanstack/react-router";
import { getCurrentUser } from "@aws-amplify/auth";

export const Route = createFileRoute("/_auth")({
    beforeLoad: async ({ location }) => {
        try {
            await getCurrentUser();
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
