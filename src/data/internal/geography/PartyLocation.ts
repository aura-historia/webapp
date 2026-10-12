import type {
    CorrectPartyLocationData,
    CreatePartyLocationData,
    DiscoverPartyLocationsResponse,
    PartyLocationData,
    PartyLocationDiscoveryCursorData,
    PartyLocationEvidence as PartyLocationEvidenceDto,
    PartyLocationManagementGrantData,
    PartyLocationsPage,
    PublicPartyLocationData,
    SetPartyLocationLifecycleData,
} from "@/client";
import {
    getSubdivisionCountry,
    parseCountryCode,
    parseSubdivisionCode,
    type CountryCode,
    type SubdivisionCode,
} from "@/data/internal/geography/GeographicCodes.ts";
import {
    isBoundedSingleLine,
    mapToBackendGeographicAssertions,
    mapToGeographicAssertions,
    validateGeographicAssertions,
    type GeographicAssertions,
    type GeographicAssertionsInput,
    type GeographicAssertionsValidationError,
} from "@/data/internal/geography/GeographicAssertions.ts";
import {
    isValidGeographicPosition,
    mapToBackendGeographicPosition,
    mapToGeographicPosition,
    mapToGeographicPositionParts,
    type GeographicPosition,
} from "@/data/internal/geography/GeographicPosition.ts";

export const PARTY_LOCATION_ROLES = [
    "BUSINESS_PREMISES",
    "WAREHOUSE",
    "REGISTERED_ADDRESS",
    "CORRESPONDENCE",
] as const satisfies readonly PartyLocationData["roles"][number][];
/** Business use of a site; never a claim about stock, dispatch or pickup. */
export type PartyLocationRole = (typeof PARTY_LOCATION_ROLES)[number];

export const PARTY_LOCATION_LIFECYCLES = ["ACTIVE", "RETIRED"] as const;
export type PartyLocationLifecycle = (typeof PARTY_LOCATION_LIFECYCLES)[number];

export const PARTY_LOCATION_EVIDENCE_SCOPES = [
    "SITE_DESCRIPTION",
    "REGISTERED_ADDRESS",
    "CORRESPONDENCE_ADDRESS",
] as const satisfies readonly PartyLocationEvidenceDto["scope"][];
export type PartyLocationEvidenceScope = (typeof PARTY_LOCATION_EVIDENCE_SCOPES)[number];

export const MAX_PARTY_LOCATION_LABEL_BYTES = 255;
export const MAX_EVIDENCE_REFERENCE_BYTES = 2048;

/** An opaque reference that is never fetched. The scope is not caller identity or trust. */
export type PartyLocationEvidence = {
    readonly reference: string;
    readonly observedAt?: Date;
    readonly scope: PartyLocationEvidenceScope;
};

/**
 * Protected management view of one Party site. `geography` and `position` are caller assertions,
 * not geocoder output. `revision` is the expected revision for every protected mutation.
 */
export type PartyLocation = {
    readonly id: string;
    readonly partyId: string;
    readonly label: string;
    readonly roles: readonly PartyLocationRole[];
    readonly geography?: GeographicAssertions;
    readonly position?: GeographicPosition;
    readonly lifecycle: PartyLocationLifecycle | "UNKNOWN";
    readonly revision: number;
    readonly inputRevision: number;
    readonly evidence?: PartyLocationEvidence;
    /**
     * An unrecognized role, scope or geographic value was omitted. Do not send the omitted members
     * back in a correction; omit them so the stored values remain unchanged.
     */
    readonly hasUnsupportedValues: boolean;
};

export type PartyLocationPage = {
    readonly items: readonly PartyLocation[];
    /** Pass as `after`; absent when exhausted. */
    readonly next?: string;
};

export type PartyLocationEvidenceInput = {
    readonly reference: string;
    readonly observedAt?: Date;
    readonly scope: PartyLocationEvidenceScope;
};

export type CreatePartyLocationInput = {
    readonly label: string;
    readonly roles?: readonly PartyLocationRole[];
    readonly geography?: GeographicAssertionsInput;
    readonly position?: GeographicPosition;
    readonly evidence?: PartyLocationEvidenceInput;
    /** Relocation: creates a new site and retires this one atomically. */
    readonly relocates?: { readonly id: string; readonly revision: number };
};

/**
 * Same-site correction. Omitted members stay unchanged; `null` clears geography, position or
 * evidence; `roles: []` clears all roles. Label and roles cannot be null.
 */
export type CorrectPartyLocationInput = {
    readonly expectedRevision: number;
    readonly label?: string;
    readonly roles?: readonly PartyLocationRole[];
    readonly geography?: GeographicAssertionsInput | null;
    readonly position?: GeographicPosition | null;
    readonly evidence?: PartyLocationEvidenceInput | null;
};

export type PartyLocationValidationError =
    | "LABEL_INVALID"
    | "POSITION_INVALID"
    | "EVIDENCE_INVALID"
    | GeographicAssertionsValidationError;

function mapEvidence(data: PartyLocationEvidenceDto | null | undefined) {
    if (!data) return undefined;
    const scope = PARTY_LOCATION_EVIDENCE_SCOPES.find((value) => value === data.scope);
    if (!scope) return undefined;
    const observedAt = data.observedAt ? new Date(data.observedAt) : undefined;
    return {
        reference: data.reference,
        scope,
        ...(observedAt && !Number.isNaN(observedAt.getTime()) ? { observedAt } : {}),
    } satisfies PartyLocationEvidence;
}

export function mapToPartyLocation(data: PartyLocationData): PartyLocation {
    const roles = data.roles.flatMap((role) => PARTY_LOCATION_ROLES.filter((r) => r === role));
    const geography = mapToGeographicAssertions(data.geography);
    const position = mapToGeographicPosition(data.position);
    const evidence = mapEvidence(data.evidence);
    const lifecycle = PARTY_LOCATION_LIFECYCLES.find((value) => value === data.lifecycle);

    return {
        id: data.id,
        partyId: data.partyId,
        label: data.label,
        roles,
        ...(geography ? { geography } : {}),
        ...(position ? { position } : {}),
        lifecycle: lifecycle ?? "UNKNOWN",
        revision: data.revision,
        inputRevision: data.inputRevision,
        ...(evidence ? { evidence } : {}),
        hasUnsupportedValues:
            roles.length !== data.roles.length ||
            (geography?.hasUnsupportedValues ?? false) ||
            (data.position != null && !position) ||
            (data.evidence != null && !evidence) ||
            !lifecycle,
    };
}

export function mapToPartyLocationPage(data: PartyLocationsPage): PartyLocationPage {
    return {
        items: data.items.map(mapToPartyLocation),
        ...(data.next ? { next: data.next } : {}),
    };
}

function mapToBackendEvidence(evidence: PartyLocationEvidenceInput): PartyLocationEvidenceDto {
    return {
        reference: evidence.reference,
        scope: evidence.scope,
        ...(evidence.observedAt ? { observedAt: evidence.observedAt.toISOString() } : {}),
    };
}

export function validatePartyLocationInput(
    input: CreatePartyLocationInput | CorrectPartyLocationInput,
): PartyLocationValidationError | undefined {
    if (
        input.label !== undefined &&
        !isBoundedSingleLine(input.label.trim(), MAX_PARTY_LOCATION_LABEL_BYTES)
    ) {
        return "LABEL_INVALID";
    }
    if (input.geography) {
        const error = validateGeographicAssertions(input.geography);
        if (error) return error;
    }
    if (input.position && !isValidGeographicPosition(input.position)) return "POSITION_INVALID";
    if (
        input.evidence &&
        !isBoundedSingleLine(input.evidence.reference, MAX_EVIDENCE_REFERENCE_BYTES)
    ) {
        return "EVIDENCE_INVALID";
    }
    return undefined;
}

export function mapToBackendCreatePartyLocation(
    input: CreatePartyLocationInput,
): CreatePartyLocationData {
    return {
        label: input.label.trim(),
        ...(input.roles ? { roles: [...input.roles] } : {}),
        ...(input.geography
            ? { geography: mapToBackendGeographicAssertions(input.geography) }
            : {}),
        ...(input.position ? { position: mapToBackendGeographicPosition(input.position) } : {}),
        ...(input.evidence ? { evidence: mapToBackendEvidence(input.evidence) } : {}),
        ...(input.relocates
            ? { relocates: { id: input.relocates.id, revision: input.relocates.revision } }
            : {}),
    };
}

export function mapToBackendCorrectPartyLocation(
    input: CorrectPartyLocationInput,
): CorrectPartyLocationData {
    const { geography, position, evidence } = input;
    return {
        expectedRevision: input.expectedRevision,
        correction: "SAME_SITE",
        ...(input.label === undefined ? {} : { label: input.label.trim() }),
        ...(input.roles === undefined ? {} : { roles: [...input.roles] }),
        ...(geography === undefined
            ? {}
            : { geography: geography && mapToBackendGeographicAssertions(geography) }),
        ...(position === undefined
            ? {}
            : { position: position && mapToBackendGeographicPosition(position) }),
        ...(evidence === undefined ? {} : { evidence: evidence && mapToBackendEvidence(evidence) }),
    };
}

export function mapToBackendSetPartyLocationLifecycle(
    lifecycle: PartyLocationLifecycle,
    expectedRevision: number,
): SetPartyLocationLifecycleData {
    return { expectedRevision, lifecycle };
}

/**
 * Explicit administrator grant. `false` removes only the explicit grant; active partnership
 * membership authorizes independently. Same-state commands are no-ops.
 */
export function mapToBackendPartyLocationManagementGrant(
    granted: boolean,
): PartyLocationManagementGrantData {
    return { granted };
}

export const PUBLIC_PARTY_LOCATION_BASES = [
    "CALLER_ASSERTED",
    "ACCEPTED_DERIVED",
    "MIXED_ASSERTED_AND_DERIVED",
] as const satisfies readonly PublicPartyLocationData["basis"][];
export type PublicPartyLocationBasis = (typeof PUBLIC_PARTY_LOCATION_BASES)[number] | "UNKNOWN";

/** Public discovery result: no raw address, evidence or revision. Sites of one Party stay separate. */
export type PublicPartyLocation = {
    readonly partyId: string;
    readonly partyName: string;
    readonly locationId: string;
    readonly label: string;
    readonly basis: PublicPartyLocationBasis;
    readonly country?: CountryCode;
    readonly subdivision?: SubdivisionCode;
    readonly position?: GeographicPosition;
    /** Already rounded by the backend to the evidence precision. */
    readonly distanceKm?: number;
};

/** Opaque continuation; send back unchanged with the same query. `distanceKm` is unrounded. */
export type PartyLocationDiscoveryCursor = {
    readonly locationId: string;
    readonly distanceKm?: number;
};

export type PartyLocationDiscoveryPage = {
    readonly items: readonly PublicPartyLocation[];
    readonly size: number;
    readonly searchAfter?: PartyLocationDiscoveryCursor;
};

export function mapToPublicPartyLocation(data: PublicPartyLocationData): PublicPartyLocation {
    const country = parseCountryCode(data.country);
    const subdivision = parseSubdivisionCode(data.subdivision);
    const position = mapToGeographicPositionParts(data.point, data.precision);
    const distanceKm = data.distanceKm;
    return {
        partyId: data.partyId,
        partyName: data.partyName,
        locationId: data.locationId,
        label: data.label,
        basis: PUBLIC_PARTY_LOCATION_BASES.find((value) => value === data.basis) ?? "UNKNOWN",
        ...(country ? { country } : {}),
        ...(subdivision && (!country || getSubdivisionCountry(subdivision) === country)
            ? { subdivision }
            : {}),
        ...(position ? { position } : {}),
        ...(typeof distanceKm === "number" && Number.isFinite(distanceKm) && distanceKm >= 0
            ? { distanceKm }
            : {}),
    };
}

export function mapToPartyLocationDiscoveryCursor(
    data: PartyLocationDiscoveryCursorData | null | undefined,
): PartyLocationDiscoveryCursor | undefined {
    if (!data) return undefined;
    return {
        locationId: data.locationId,
        ...(data.distanceKm === undefined ? {} : { distanceKm: data.distanceKm }),
    };
}

export function mapToBackendPartyLocationDiscoveryCursor(
    cursor: PartyLocationDiscoveryCursor,
): PartyLocationDiscoveryCursorData {
    return {
        locationId: cursor.locationId,
        ...(cursor.distanceKm === undefined ? {} : { distanceKm: cursor.distanceKm }),
    };
}

export function mapToPartyLocationDiscoveryPage(
    data: DiscoverPartyLocationsResponse,
): PartyLocationDiscoveryPage {
    const searchAfter = mapToPartyLocationDiscoveryCursor(data.searchAfter);
    return {
        items: data.items.map(mapToPublicPartyLocation),
        size: data.size,
        ...(searchAfter ? { searchAfter } : {}),
    };
}
