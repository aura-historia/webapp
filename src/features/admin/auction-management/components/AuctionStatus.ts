import type { AuctionReportedStatusData } from "@/client";
import type { AdminMarkTone } from "@/features/admin/common/components/AdminStatusMark.tsx";

/** Reported status marks: scheduled hollow, in progress ink, ended muted, postponed brass, cancelled dashed. */
export const AUCTION_STATUS_TONES = {
    SCHEDULED: "hollow",
    IN_PROGRESS: "ink",
    ENDED: "muted",
    POSTPONED: "brass",
    CANCELLED: "dashed",
} as const satisfies Record<AuctionReportedStatusData, AdminMarkTone>;
