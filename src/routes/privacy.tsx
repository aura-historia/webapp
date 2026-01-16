import { createFileRoute } from "@tanstack/react-router";
import { Privacy } from "@/components/privacy/Privacy.tsx";
import { generatePageHeadMeta } from "@/lib/pageHeadMeta.ts";

export const Route = createFileRoute("/privacy")({
    head: () =>
        generatePageHeadMeta({
            title: "Privacy Policy | Aura Historia",
            description: "Privacy policy and data protection information for Aura Historia.",
            url: "https://aura-historia.com/privacy",
        }),
    component: Privacy,
});
