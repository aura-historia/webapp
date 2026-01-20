import { createFileRoute } from "@tanstack/react-router";
import { Privacy } from "@/components/privacy/Privacy.tsx";
import { generatePageHeadMeta } from "@/lib/pageHeadMeta.ts";

export const Route = createFileRoute("/privacy")({
    head: () =>
        generatePageHeadMeta({
            pageKey: "privacy",
            url: "https://aura-historia.com/privacy",
            noIndex: true,
        }),
    component: Privacy,
});
