import {
    isValidSourceLocationEvidenceReference,
    type SourceLocationDefault,
} from "@/data/internal/geography/SourceLocationDefault.ts";

/** Advertised inventory first: it is the only applicability that supplies listing geography. */
export const SOURCE_LOCATION_APPLICABILITIES = [
    "advertisedInventory",
    "businessAssociation",
] as const;
export type SourceLocationApplicability = (typeof SOURCE_LOCATION_APPLICABILITIES)[number];

/** An assertion exists exactly when it carries an evidence reference. */
export type ApplicabilityAssertionDraft = {
    readonly asserted: boolean;
    readonly reference: string;
};

export type ApplicabilityDraft = Readonly<
    Record<SourceLocationApplicability, ApplicabilityAssertionDraft>
>;

export type ApplicabilityDraftErrors = Partial<
    Record<SourceLocationApplicability, "evidenceRequired" | "evidenceInvalid">
>;

/** The applicability values a command sends: omitted retains, `null` removes, text sets. */
export type ApplicabilityChanges = Partial<Record<SourceLocationApplicability, string | null>>;

export const EMPTY_APPLICABILITY_DRAFT: ApplicabilityDraft = {
    advertisedInventory: { asserted: false, reference: "" },
    businessAssociation: { asserted: false, reference: "" },
};

export function toApplicabilityDraft(current?: SourceLocationDefault): ApplicabilityDraft {
    const assignment = current?.assignment;
    const draft = (reference?: string) => ({
        asserted: reference !== undefined,
        reference: reference ?? "",
    });
    return {
        advertisedInventory: draft(assignment?.advertisedInventory),
        businessAssociation: draft(assignment?.businessAssociation),
    };
}

export function validateApplicabilityDraft(draft: ApplicabilityDraft): ApplicabilityDraftErrors {
    const errors: ApplicabilityDraftErrors = {};
    for (const key of SOURCE_LOCATION_APPLICABILITIES) {
        const { asserted, reference } = draft[key];
        if (!asserted) continue;
        if (reference.trim().length === 0) errors[key] = "evidenceRequired";
        else if (!isValidSourceLocationEvidenceReference(reference))
            errors[key] = "evidenceInvalid";
    }
    return errors;
}

function assertedReference(assertion: ApplicabilityAssertionDraft): string | null {
    return assertion.asserted ? assertion.reference : null;
}

/** Both assertions of a replacing assignment; an unasserted one becomes absent. */
export function toAssignedApplicability(
    draft: ApplicabilityDraft,
): Partial<Record<SourceLocationApplicability, string>> {
    const result: Partial<Record<SourceLocationApplicability, string>> = {};
    for (const key of SOURCE_LOCATION_APPLICABILITIES) {
        const reference = assertedReference(draft[key]);
        if (reference !== null) result[key] = reference;
    }
    return result;
}

/**
 * Only the assertions the draft changed relative to `base`. Unchanged assertions are omitted, so
 * stored evidence the app could not display is kept.
 */
export function diffApplicabilityDraft(
    draft: ApplicabilityDraft,
    base: ApplicabilityDraft,
): ApplicabilityChanges {
    const changes: ApplicabilityChanges = {};
    for (const key of SOURCE_LOCATION_APPLICABILITIES) {
        const next = assertedReference(draft[key]);
        if (next !== assertedReference(base[key])) changes[key] = next;
    }
    return changes;
}

/** Reapplies only the assertions this draft changed onto a newer stored state. */
export function rebaseApplicabilityDraft(
    draft: ApplicabilityDraft,
    base: ApplicabilityDraft,
    latest: ApplicabilityDraft,
): ApplicabilityDraft {
    const changes = diffApplicabilityDraft(draft, base);
    const result = { ...latest };
    for (const key of SOURCE_LOCATION_APPLICABILITIES) {
        if (key in changes) result[key] = draft[key];
    }
    return result;
}
