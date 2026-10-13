import type {
    ListPartyLocationManagersData,
    PartyLocationManagerData,
    PartyLocationManagersPage,
} from "@/client";

export const PARTY_LOCATION_MANAGER_PAGE_SIZE = 21;

/**
 * One user who can currently manage a Party's locations. The two reasons are independent:
 * an explicit administrator grant and membership in active Partnerships of the Party.
 */
export type PartyLocationManager = {
    readonly userId: string;
    readonly email: string;
    readonly firstName?: string;
    readonly lastName?: string;
    readonly hasExplicitGrant: boolean;
    /** Active Partnerships that authorize this user; empty without partnership access. */
    readonly partnershipIds: readonly string[];
};

export type PartyLocationManagerPage = {
    readonly items: readonly PartyLocationManager[];
    readonly searchAfter?: string;
};

export type PartyLocationManagerQuery = NonNullable<ListPartyLocationManagersData["query"]>;

export function mapToPartyLocationManager(apiData: PartyLocationManagerData): PartyLocationManager {
    let hasExplicitGrant = false;
    let partnershipIds: readonly string[] = [];
    for (const access of apiData.access) {
        if (access.type === "EXPLICIT") hasExplicitGrant = true;
        if (access.type === "PARTNERSHIP") partnershipIds = access.partnershipIds;
    }
    return {
        userId: apiData.userId,
        email: apiData.email,
        ...(apiData.firstName && { firstName: apiData.firstName }),
        ...(apiData.lastName && { lastName: apiData.lastName }),
        hasExplicitGrant,
        partnershipIds,
    };
}

export function mapToPartyLocationManagerPage(
    apiData: PartyLocationManagersPage,
): PartyLocationManagerPage {
    return {
        items: apiData.items.map(mapToPartyLocationManager),
        ...(apiData.searchAfter !== undefined && { searchAfter: apiData.searchAfter }),
    };
}

/** Lists current managers, or with `userId` reads only that user's current access. */
export function mapToPartyLocationManagerQuery(
    options: { readonly userId?: string; readonly searchAfter?: string } = {},
): PartyLocationManagerQuery {
    return {
        size: options.userId ? 1 : PARTY_LOCATION_MANAGER_PAGE_SIZE,
        ...(options.userId && { userId: options.userId }),
        ...(options.searchAfter && { searchAfter: options.searchAfter }),
    };
}
