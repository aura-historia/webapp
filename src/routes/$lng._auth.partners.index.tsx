import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/$lng/_auth/partners/")({
    beforeLoad: ({ params }) => {
        throw redirect({
            to: "/$lng/partners/applications",
            params: { lng: params.lng },
            replace: true,
        });
    },
});
