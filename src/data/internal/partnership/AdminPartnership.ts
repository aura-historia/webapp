import type {
    AdminPartnershipCollectionData,
    AdminPartnershipDetailsData,
    AdminPartnershipSummaryData,
    AdminSearchPartnershipsData,
} from "@/client";

export const ADMIN_PARTNERSHIPS_PAGE_SIZE = 21;

export type AdminPartnershipFilters = {
    readonly partyId?: string;
    readonly memberUserId?: string;
    readonly listingSourceId?: string;
};

export type AdminPartnershipCursor = readonly [created: string, partnershipId: string];

export type AdminPartnershipSummary = {
    readonly partnershipId: string;
    readonly party: {
        readonly partyId: string;
        readonly partySlugId: string;
        readonly name: string;
    };
    readonly memberCount: number;
    readonly listingSourceGrantCount: number;
    readonly created: Date;
    readonly updated: Date;
};

export type AdminPartnershipDetails = AdminPartnershipSummary & {
    /** The API returns only the first 100 ordered references, independently of memberCount. */
    readonly memberUserIds: readonly string[];
    /** The API returns only the first 100 ordered references, independently of grantCount. */
    readonly listingSourceIds: readonly string[];
};

export type AdminPartnershipPage = {
    readonly items: readonly AdminPartnershipSummary[];
    /** Requested page size after server clamping. This is not a total result count. */
    readonly pageSize: number;
    readonly searchAfter?: AdminPartnershipCursor;
};

function mapSummary(dto: AdminPartnershipSummaryData): AdminPartnershipSummary {
    return {
        partnershipId: dto.partnershipId,
        party: {
            partyId: dto.party.partyId,
            partySlugId: dto.party.partySlugId,
            name: dto.party.name,
        },
        memberCount: dto.memberCount,
        listingSourceGrantCount: dto.listingSourceGrantCount,
        created: new Date(dto.created),
        updated: new Date(dto.updated),
    };
}

export function mapToAdminPartnershipSummary(
    dto: AdminPartnershipSummaryData,
): AdminPartnershipSummary {
    return mapSummary(dto);
}

export function mapToAdminPartnershipDetails(
    dto: AdminPartnershipDetailsData,
): AdminPartnershipDetails {
    return {
        ...mapSummary(dto),
        memberUserIds: [...dto.memberUserIds],
        listingSourceIds: [...dto.listingSourceIds],
    };
}

export function mapToAdminPartnershipPage(
    dto: AdminPartnershipCollectionData,
): AdminPartnershipPage {
    return {
        items: dto.items.map(mapToAdminPartnershipSummary),
        pageSize: dto.size,
        searchAfter: dto.searchAfter,
    };
}

export function mapToAdminPartnershipSearchQuery(
    filters: AdminPartnershipFilters,
    cursor?: AdminPartnershipCursor,
): NonNullable<AdminSearchPartnershipsData["query"]> {
    return Object.fromEntries(
        Object.entries({
            partyId: filters.partyId,
            memberUserId: filters.memberUserId,
            listingSourceId: filters.listingSourceId,
            searchAfter: cursor ? JSON.stringify(cursor) : undefined,
            size: ADMIN_PARTNERSHIPS_PAGE_SIZE,
        }).filter(([, value]) => value !== undefined),
    ) as NonNullable<AdminSearchPartnershipsData["query"]>;
}
