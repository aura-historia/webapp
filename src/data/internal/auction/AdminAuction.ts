import type {
    AuctionAdminData,
    AuctionFormatData,
    AuctionReportedStatusData,
    AuctionScheduleData,
    LocalizedTextData,
} from "@/client";

export type AuctionSchedule = {
    readonly biddingOpens: Date | null;
    readonly liveStarts: Date | null;
    readonly lotsBeginClosing: Date | null;
    readonly scheduledEnd: Date | null;
};

export type AdminAuction = {
    readonly auctionId: string;
    readonly listingSourceId: string;
    readonly sourceAuctionId: string;
    readonly name: LocalizedTextData | null;
    readonly catalogueUrl: string | null;
    readonly format: AuctionFormatData | null;
    readonly schedule: AuctionSchedule;
    readonly reportedStatus: AuctionReportedStatusData | null;
    readonly reportedLotCount: number | null;
    readonly expectedVersion: number;
    readonly created: Date;
    readonly updated: Date;
};

function mapSchedule(data: AuctionScheduleData): AuctionSchedule {
    return {
        biddingOpens: data.biddingOpens === null ? null : new Date(data.biddingOpens),
        liveStarts: data.liveStarts === null ? null : new Date(data.liveStarts),
        lotsBeginClosing: data.lotsBeginClosing === null ? null : new Date(data.lotsBeginClosing),
        scheduledEnd: data.scheduledEnd === null ? null : new Date(data.scheduledEnd),
    };
}

export function mapAdminAuction(data: AuctionAdminData): AdminAuction {
    return {
        auctionId: data.auctionId,
        listingSourceId: data.listingSourceId,
        sourceAuctionId: data.sourceAuctionId,
        name: data.name,
        catalogueUrl: data.catalogueUrl,
        format: data.format,
        schedule: mapSchedule(data.schedule),
        reportedStatus: data.reportedStatus,
        reportedLotCount: data.reportedLotCount,
        expectedVersion: data.expectedVersion,
        created: new Date(data.created),
        updated: new Date(data.updated),
    };
}
