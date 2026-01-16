import { createFileRoute } from "@tanstack/react-router";
import { Imprint } from "@/components/imprint/Imprint.tsx";
import { generatePageHeadMeta } from "@/lib/pageHeadMeta.ts";

export const Route = createFileRoute("/imprint")({
    head: () =>
        generatePageHeadMeta({
            title: "Imprint | Aura Historia",
            description: "Legal information and imprint for Aura Historia.",
            url: "https://aura-historia.com/imprint",
        }),
    component: Imprint,
});
