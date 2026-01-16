import { AccountPage } from "@/components/account/AccountPage.tsx";
import { createFileRoute } from "@tanstack/react-router";
import { generatePageHeadMeta } from "@/lib/pageHeadMeta.ts";

export const Route = createFileRoute("/_auth/account")({
    head: () =>
        generatePageHeadMeta({
            title: "My Account | Aura Historia",
            noIndex: true,
        }),
    component: AccountPage,
});
