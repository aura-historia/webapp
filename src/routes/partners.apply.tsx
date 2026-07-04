import { PARTNERS_PAGE_FRAGMENTS } from "@/features/partners/components/PartnersPage.fragments.ts";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/partners/apply")({
    beforeLoad: () => {
        throw redirect({
            to: "/partners",
            hash: PARTNERS_PAGE_FRAGMENTS.apply,
        });
    },
});
