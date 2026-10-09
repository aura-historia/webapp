import type {
    AdminSearchPartiesData,
    CreatePartyData,
    PartyCollectionData,
    PartyData,
    PartySummaryData,
    UpdatePartyData,
} from "@/client";

export const ADMIN_PARTY_SORT_FIELDS = ["name", "email", "phone", "created", "updated"] as const;
export type AdminPartySortField = (typeof ADMIN_PARTY_SORT_FIELDS)[number];
export const ADMIN_PARTY_SORT_ORDERS = ["asc", "desc"] as const;
export type AdminPartySortOrder = (typeof ADMIN_PARTY_SORT_ORDERS)[number];

export type PartyIdentity = {
    readonly partyId: string;
    readonly partySlugId: string;
};

export type Party = PartyIdentity & {
    readonly name: string;
    readonly contact: {
        readonly phone?: string;
        readonly email?: string;
    };
    readonly created: Date;
    readonly updated: Date;
};

export type AdminPartyPage = {
    readonly items: readonly Party[];
    /** Opaque cursor returned by the API; it must be sent back unchanged. */
    readonly searchAfter?: string;
    readonly total?: number;
};

export type AdminPartyFilters = {
    readonly query?: string;
    readonly name?: string;
    readonly phone?: string;
    readonly email?: string;
    readonly createdFrom?: string;
    readonly createdTo?: string;
    readonly updatedFrom?: string;
    readonly updatedTo?: string;
    readonly sort?: AdminPartySortField;
    readonly order?: AdminPartySortOrder;
};

export type AdminPartySearchQuery = NonNullable<AdminSearchPartiesData["query"]>;

export const ADMIN_PARTY_PAGE_SIZE = 25;

function mapPartyFields(data: PartyData | PartySummaryData): Party {
    return {
        partyId: data.partyId,
        partySlugId: data.partySlugId,
        name: data.name,
        contact: {
            ...(data.contact.phone ? { phone: data.contact.phone } : {}),
            ...(data.contact.email ? { email: data.contact.email } : {}),
        },
        created: new Date(data.created),
        updated: new Date(data.updated),
    };
}

export function mapToParty(data: PartyData): Party {
    return mapPartyFields(data);
}

export function mapToPartySummary(data: PartySummaryData): Party {
    return mapPartyFields(data);
}

export function mapToAdminPartyPage(data: PartyCollectionData): AdminPartyPage {
    return {
        items: data.items.map(mapToPartySummary),
        ...(data.searchAfter ? { searchAfter: data.searchAfter } : {}),
        ...(typeof data.total === "number" ? { total: data.total } : {}),
    };
}

/** True only for a real YYYY-MM-DD calendar day, rejecting rollover dates. */
export function isPartyCalendarDay(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

function dayBound(day: string | undefined, bound: "start" | "end"): string | undefined {
    if (!day || !isPartyCalendarDay(day)) return undefined;
    return `${day}T${bound === "start" ? "00:00:00.000" : "23:59:59.999"}Z`;
}

function trimmed(value: string | undefined): string | undefined {
    const result = value?.trim();
    return result || undefined;
}

/** Builds the endpoint query while preserving its opaque cursor exactly. */
export function mapToAdminPartySearchQuery(
    filters: AdminPartyFilters,
    searchAfter?: string,
    size = ADMIN_PARTY_PAGE_SIZE,
): AdminPartySearchQuery {
    const query: AdminPartySearchQuery = { size };
    for (const key of ["query", "name", "phone", "email"] as const) {
        const value = trimmed(filters[key]);
        if (value) query[key] = value;
    }
    const createdMin = dayBound(filters.createdFrom, "start");
    const createdMax = dayBound(filters.createdTo, "end");
    const updatedMin = dayBound(filters.updatedFrom, "start");
    const updatedMax = dayBound(filters.updatedTo, "end");
    if (createdMin) query["created[min]"] = createdMin;
    if (createdMax) query["created[max]"] = createdMax;
    if (updatedMin) query["updated[min]"] = updatedMin;
    if (updatedMax) query["updated[max]"] = updatedMax;
    if (filters.sort && filters.order) {
        query.sort = filters.sort;
        query.order = filters.order;
    }
    if (searchAfter) query.searchAfter = searchAfter;
    return query;
}

export type PartyFormValues = {
    readonly name: string;
    readonly phone: string;
    readonly email: string;
};

export function buildCreatePartyData(values: PartyFormValues): CreatePartyData {
    const name = values.name.trim();
    const phone = values.phone.trim();
    const email = values.email.trim();
    return {
        name,
        ...(phone ? { phone } : {}),
        ...(email ? { email } : {}),
    };
}

/** Omit unchanged members; null explicitly clears an existing phone or email. */
export function buildUpdatePartyData(party: Party, values: PartyFormValues): UpdatePartyData {
    const patch: UpdatePartyData = {};
    const name = values.name.trim();
    const phone = values.phone.trim();
    const email = values.email.trim();
    if (name !== party.name) patch.name = name;
    if (phone !== (party.contact.phone ?? "")) patch.phone = phone || null;
    if (email !== (party.contact.email ?? "")) patch.email = email || null;
    return patch;
}
