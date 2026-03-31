import { AccountPage } from "@/components/account/AccountPage.tsx";
import { createFileRoute } from "@tanstack/react-router";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";

export const Route = createFileRoute("/_auth/account")({
    ssr: false,
    head: () =>
        generatePageHeadMeta({
            pageKey: "account",
            noIndex: true,
        }),
    component: AccountPage,
});
