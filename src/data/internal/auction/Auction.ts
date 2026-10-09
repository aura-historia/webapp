import type {
    AuctionAdminData,
    AuctionFormatData,
    AuctionReportedStatusData,
    AuctionScheduleData,
    LocalizedTextData,
    PublicAuctionData,
    PublicAuctionDirectoryCursorData,
    PublicAuctionDirectoryData,
    PublicAuctionDirectoryItemData,
    PublicAuctionSourceData,
} from "@/client";

export type AuctionSchedule = {
    readonly biddingOpens: Date | null;
    readonly liveStarts: Date | null;
    readonly lotsBeginClosing: Date | null;
    readonly scheduledEnd: Date | null;
};

export type AuctionSource = {
    readonly listingSourceId: string;
    readonly name: string;
    readonly slugId: string;
};

export type AuctionDirectoryItem = {
    readonly auctionId: string;
    readonly listingSource: AuctionSource;
    readonly name: LocalizedTextData | null;
    readonly format: AuctionFormatData | null;
    readonly schedule: AuctionSchedule;
    readonly reportedStatus: AuctionReportedStatusData | null;
    readonly created: Date;
};

export type PublicAuction = Omit<AuctionDirectoryItem, "created"> & {
    readonly catalogueUrl: URL | null;
    readonly viewUrl: URL | null;
    readonly reportedLotCount: number | null;
    readonly visibleListingCount: number;
};

export type PublicAuctionDirectoryPage = {
    readonly items: readonly AuctionDirectoryItem[];
    readonly pageSize: number;
    readonly searchAfter?: PublicAuctionDirectoryCursorData | null;
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

export type AuctionCatalogueCursor = {
    readonly auctionId: string;
    readonly cataloguePosition: number | null;
    readonly productListingId: string;
};

export type AuctionCataloguePage<Item> = {
    readonly items: readonly Item[];
    readonly pageSize: number;
    readonly searchAfter?: AuctionCatalogueCursor | null;
};

export type AuctionOperation =
    | "publicDirectory"
    | "publicDetail"
    | "catalogue"
    | "adminRead"
    | "sourceSearch"
    | "create"
    | "update";

export type AuctionDirectoryFilters = {
    readonly listingSourceId?: string;
    readonly format?: AuctionFormatData;
    readonly reportedStatus?: AuctionReportedStatusData;
    readonly timeRole?: "BIDDING_OPENS" | "LIVE_STARTS" | "LOTS_BEGIN_CLOSING" | "SCHEDULED_END";
    readonly from?: string;
    readonly to?: string;
};

function mapSchedule(data: AuctionScheduleData): AuctionSchedule {
    return {
        biddingOpens: data.biddingOpens === null ? null : new Date(data.biddingOpens),
        liveStarts: data.liveStarts === null ? null : new Date(data.liveStarts),
        lotsBeginClosing: data.lotsBeginClosing === null ? null : new Date(data.lotsBeginClosing),
        scheduledEnd: data.scheduledEnd === null ? null : new Date(data.scheduledEnd),
    };
}

function mapSource(data: PublicAuctionSourceData): AuctionSource {
    return {
        listingSourceId: data.listingSourceId,
        name: data.name,
        slugId: data.slugId,
    };
}

function mapHttpUrl(value: string | null): URL | null {
    if (value === null) return null;
    const url = URL.parse(value);
    return url?.protocol === "http:" || url?.protocol === "https:" ? url : null;
}

export function mapAuctionDirectoryItem(
    data: PublicAuctionDirectoryItemData,
): AuctionDirectoryItem {
    return {
        auctionId: data.auctionId,
        listingSource: mapSource(data.listingSource),
        name: data.name,
        format: data.format,
        schedule: mapSchedule(data.schedule),
        reportedStatus: data.reportedStatus,
        created: new Date(data.created),
    };
}

export function mapPublicAuction(data: PublicAuctionData): PublicAuction {
    return {
        auctionId: data.auctionId,
        listingSource: mapSource(data.listingSource),
        name: data.name,
        catalogueUrl: mapHttpUrl(data.catalogueUrl),
        viewUrl: mapHttpUrl(data.viewUrl),
        format: data.format,
        schedule: mapSchedule(data.schedule),
        reportedStatus: data.reportedStatus,
        reportedLotCount: data.reportedLotCount,
        visibleListingCount: data.visibleListingCount,
    };
}

export function mapPublicAuctionDirectory(
    data: PublicAuctionDirectoryData,
): PublicAuctionDirectoryPage {
    return {
        items: data.items.map(mapAuctionDirectoryItem),
        pageSize: data.pageSize,
        ...(Object.hasOwn(data, "searchAfter") && { searchAfter: data.searchAfter }),
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

export function serializeAuctionCursor(
    cursor: PublicAuctionDirectoryCursorData | AuctionCatalogueCursor | null | undefined,
): string | undefined {
    return cursor == null ? undefined : JSON.stringify(cursor);
}

export function toAuctionUtcInput(value: Date | null): string {
    return value ? value.toISOString().slice(0, 16) : "";
}

export function fromAuctionUtcInput(value: string): string | null {
    return value ? new Date(`${value}:00Z`).toISOString() : null;
}
