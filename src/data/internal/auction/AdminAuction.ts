import type {
    AdminAuctionSearchCollectionData,
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

/** Responses omit absent members; an omitted member maps to `null`. */
function mapNullableDate(value: string | undefined): Date | null {
    return value == null ? null : new Date(value);
}

function mapSchedule(data: AuctionScheduleData): AuctionSchedule {
    return {
        biddingOpens: mapNullableDate(data.biddingOpens),
        liveStarts: mapNullableDate(data.liveStarts),
        lotsBeginClosing: mapNullableDate(data.lotsBeginClosing),
        scheduledEnd: mapNullableDate(data.scheduledEnd),
    };
}

export function mapAdminAuction(data: AuctionAdminData): AdminAuction {
    return {
        auctionId: data.auctionId,
        listingSourceId: data.listingSourceId,
        sourceAuctionId: data.sourceAuctionId,
        name: data.name ?? null,
        catalogueUrl: data.catalogueUrl ?? null,
        format: data.format ?? null,
        schedule: mapSchedule(data.schedule),
        reportedStatus: data.reportedStatus ?? null,
        reportedLotCount: data.reportedLotCount ?? null,
        expectedVersion: data.expectedVersion,
        created: new Date(data.created),
        updated: new Date(data.updated),
    };
}

export type AdminAuctionPage = {
    readonly items: readonly AdminAuction[];
    /** Opaque cursor; pass it back unchanged with the same filters, sort, order and size. */
    readonly searchAfter?: string;
};

/** The search page reports no total; its `size` is only the returned item count. */
export function mapAdminAuctionPage(data: AdminAuctionSearchCollectionData): AdminAuctionPage {
    return {
        items: data.items.map(mapAdminAuction),
        ...(data.searchAfter !== undefined && { searchAfter: data.searchAfter }),
    };
}
