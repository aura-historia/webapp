import { createFileRoute } from "@tanstack/react-router";
import { Imprint } from "@/components/imprint/Imprint.tsx";
import { generatePageHeadMeta } from "@/lib/pageHeadMeta.ts";

export const Route = createFileRoute("/imprint")({
    head: () =>
        generatePageHeadMeta({
            pageKey: "imprint",
            url: "https://aura-historia.com/imprint",
            noIndex: true,
        }),
    component: Imprint,
});
