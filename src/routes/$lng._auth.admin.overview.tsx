import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$lng/_auth/admin/overview")({
    // Temporarily keep the route while the admin dashboard is being reworked.
    component: () => null,
});
