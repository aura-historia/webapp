import { PARTNER_PROGRAM_FRAGMENTS } from "@/features/partner/partner-program/config/partnerProgramFragments.ts";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/$lng/partner-program/apply")({
    beforeLoad: ({ params }) => {
        throw redirect({
            to: "/$lng/partner-program",
            params: { lng: params.lng },
            hash: PARTNER_PROGRAM_FRAGMENTS.apply,
        });
    },
});
