import { PARTNER_PROGRAM_FRAGMENTS } from "@/features/partner/partner-program/config/partnerProgramFragments.ts";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/partner-program/apply")({
    beforeLoad: () => {
        throw redirect({
            to: "/partner-program",
            hash: PARTNER_PROGRAM_FRAGMENTS.apply,
        });
    },
});
