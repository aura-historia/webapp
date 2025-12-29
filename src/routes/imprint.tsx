import { createFileRoute } from "@tanstack/react-router";
import { Imprint } from "@/components/imprint/Imprint.tsx";

export const Route = createFileRoute("/imprint")({
    component: Imprint,
});
