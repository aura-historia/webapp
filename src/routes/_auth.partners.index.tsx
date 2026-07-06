import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/partners/")({
    beforeLoad: () => {
        throw redirect({
            to: "/partners/applications",
            replace: true,
        });
    },
});
