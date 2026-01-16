import { createFileRoute } from "@tanstack/react-router";
import { Privacy } from "@/components/privacy/Privacy.tsx";

export const Route = createFileRoute("/privacy")({
    component: Privacy,
});
