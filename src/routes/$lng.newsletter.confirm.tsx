import { createFileRoute } from "@tanstack/react-router";
import { NewsletterConfirmationPage } from "@/features/newsletter/pages/NewsletterConfirmationPage.tsx";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";
import { env } from "@/env";

// Public and unguarded: the confirmation capability travels only in the URL fragment, which the
// page reads after hydration. Never add a loader, search param or server function for it.
export const Route = createFileRoute("/$lng/newsletter/confirm")({
    headers: () => ({
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
        "X-Robots-Tag": "noindex, nofollow",
    }),
    head: () => {
        const head = generatePageHeadMeta({
            pageKey: "newsletterConfirm",
            url: `${env.VITE_APP_URL}/newsletter/confirm`,
            noIndex: true,
        });

        return { ...head, meta: [...head.meta, { name: "referrer", content: "no-referrer" }] };
    },
    component: NewsletterConfirmationPage,
});
