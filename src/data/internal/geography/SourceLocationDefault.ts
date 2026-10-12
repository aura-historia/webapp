import type {
    AssignSourceLocationDefaultData,
    ChangeSourceLocationDefaultApplicabilityData,
    ClearSourceLocationDefaultData,
    SourceLocationDefaultData,
    SourceLocationDefaultEvidence,
} from "@/client";
import { isBoundedSingleLine } from "@/data/internal/geography/GeographicAssertions.ts";
import { MAX_EVIDENCE_REFERENCE_BYTES } from "@/data/internal/geography/PartyLocation.ts";

/**
 * A ListingSource's zero-or-one explicit PartyLocation default. Associated business and advertised
 * inventory are independent assertions, each backed by its own opaque evidence reference. Business
 * association alone never supplies listing geography.
 */
export type SourceLocationDefault = {
    readonly listingSourceId: string;
    /** Expected revision for every assignment, applicability change or clear. */
    readonly revision: number;
    readonly assignment?: {
        readonly partyLocationId: string;
        /** Opaque evidence reference for the associated-business assertion. */
        readonly businessAssociation?: string;
        /** Opaque evidence reference for the advertised-inventory assertion. */
        readonly advertisedInventory?: string;
    };
    /** A retired reference is retained for traceability but supplies no inherited geography. */
    readonly eligibility?: "ACTIVE" | "RETIRED" | "UNKNOWN";
    /** An evidence entry had an unexpected scope and was omitted. */
    readonly hasUnsupportedValues: boolean;
};

function mapEvidence(
    data: SourceLocationDefaultEvidence | null | undefined,
    scope: SourceLocationDefaultEvidence["scope"],
): string | undefined {
    return data?.scope === scope ? data.reference : undefined;
}

export function mapToSourceLocationDefault(data: SourceLocationDefaultData): SourceLocationDefault {
    const assignment = data.assignment;
    const businessAssociation = mapEvidence(assignment?.businessAssociation, "ASSOCIATED_BUSINESS");
    const advertisedInventory = mapEvidence(
        assignment?.advertisedInventory,
        "ADVERTISED_INVENTORY",
    );
    const eligibility = data.eligibility as string | null | undefined;

    return {
        listingSourceId: data.listingSourceId,
        revision: data.revision,
        ...(assignment
            ? {
                  assignment: {
                      partyLocationId: assignment.partyLocationId,
                      ...(businessAssociation ? { businessAssociation } : {}),
                      ...(advertisedInventory ? { advertisedInventory } : {}),
                  },
              }
            : {}),
        ...(eligibility == null
            ? {}
            : {
                  eligibility:
                      eligibility === "ACTIVE" || eligibility === "RETIRED"
                          ? eligibility
                          : "UNKNOWN",
              }),
        hasUnsupportedValues:
            (assignment?.businessAssociation != null && !businessAssociation) ||
            (assignment?.advertisedInventory != null && !advertisedInventory),
    };
}

export function isValidSourceLocationEvidenceReference(reference: string): boolean {
    return isBoundedSingleLine(reference, MAX_EVIDENCE_REFERENCE_BYTES);
}

function toEvidence(
    reference: string | null | undefined,
    scope: SourceLocationDefaultEvidence["scope"],
): SourceLocationDefaultEvidence | null | undefined {
    if (reference === undefined || reference === null) return reference;
    return { reference, scope };
}

/** Replaces the reference and both assertions; an omitted assertion becomes absent. */
export function mapToBackendAssignSourceLocationDefault(input: {
    readonly expectedRevision: number;
    readonly partyLocationId: string;
    readonly businessAssociation?: string;
    readonly advertisedInventory?: string;
}): AssignSourceLocationDefaultData {
    return {
        expectedRevision: input.expectedRevision,
        partyLocationId: input.partyLocationId,
        businessAssociation: toEvidence(input.businessAssociation, "ASSOCIATED_BUSINESS") ?? null,
        advertisedInventory: toEvidence(input.advertisedInventory, "ADVERTISED_INVENTORY") ?? null,
    };
}

/** Omitted retains an assertion; `null` removes it; a string sets its evidence reference. */
export function mapToBackendChangeSourceLocationDefaultApplicability(input: {
    readonly expectedRevision: number;
    readonly businessAssociation?: string | null;
    readonly advertisedInventory?: string | null;
}): ChangeSourceLocationDefaultApplicabilityData {
    const businessAssociation = toEvidence(input.businessAssociation, "ASSOCIATED_BUSINESS");
    const advertisedInventory = toEvidence(input.advertisedInventory, "ADVERTISED_INVENTORY");
    return {
        expectedRevision: input.expectedRevision,
        ...(businessAssociation === undefined ? {} : { businessAssociation }),
        ...(advertisedInventory === undefined ? {} : { advertisedInventory }),
    };
}

export function mapToBackendClearSourceLocationDefault(
    expectedRevision: number,
): ClearSourceLocationDefaultData {
    return { expectedRevision };
}
