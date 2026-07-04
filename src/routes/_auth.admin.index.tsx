import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/admin/")({
    beforeLoad: () => {
        throw redirect({
            to: "/admin/overview",
            replace: true,
        });
    },
});
