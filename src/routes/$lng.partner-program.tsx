import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$lng/partner-program")({
    component: Outlet,
});
