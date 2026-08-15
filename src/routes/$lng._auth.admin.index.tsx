import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/$lng/_auth/admin/")({
    beforeLoad: ({ params }) => {
        throw redirect({
            to: "/$lng/admin/overview",
            params: { lng: params.lng },
            replace: true,
        });
    },
});
