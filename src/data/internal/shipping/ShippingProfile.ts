import type {
    AssignShippingDefaultData,
    ClearShippingDefaultData,
    CreateShippingProfileData,
    ReplaceShippingProfileData,
    ShippingDefaultData,
    ShippingProfileData,
    ShippingProfileLifecycleData,
    ShippingProfileSummaryData,
} from "@/client";
import {
    type AdvertisedDeliveryTerms,
    mapToAdvertisedDeliveryTerms,
    mapToBackendAdvertisedDeliveryTerms,
} from "@/data/internal/shipping/ShippingTerms.ts";

/*
 * Protected source shipping management: profiles and the explicit source default. Reads and
 * errors are `no-store`; only administrators and current Partnership members with the source
 * grant may use them (delegated credentials also need `listing-sources:read`/`write`).
 * Revisions are compare-and-swap fences sent back unchanged. The producer-only `import`
 * envelope is never sent from the browser, and evidence is write-only.
 */

export type ShippingProfileLifecycle = "ACTIVE" | "RETIRED" | "UNKNOWN";

function mapLifecycle(lifecycle: string): ShippingProfileLifecycle {
    return lifecycle === "ACTIVE" || lifecycle === "RETIRED" ? lifecycle : "UNKNOWN";
}

export type ShippingProfileSummary = {
    readonly shippingProfileId: string;
    readonly listingSourceId: string;
    readonly name: string;
    /** Sent as `expectedRevision` with every profile command, including no-ops. */
    readonly managementRevision: number;
    /** Advances only with content or lifecycle changes. */
    readonly termsRevision: number;
    readonly lifecycle: ShippingProfileLifecycle;
};

export type ShippingProfile = ShippingProfileSummary & {
    readonly attributedPartyId: string | null;
    /** Absent when `hasUnsupportedValues`: the stored terms hold values this app cannot read. */
    readonly terms?: AdvertisedDeliveryTerms;
    /**
     * The profile can be retired or restored but not replaced: a replacement would drop what
     * this app could not read.
     */
    readonly hasUnsupportedValues: boolean;
};

export function mapToShippingProfileSummary(
    data: ShippingProfileSummaryData,
): ShippingProfileSummary {
    return {
        shippingProfileId: data.shippingProfileId,
        listingSourceId: data.listingSourceId,
        name: data.name,
        managementRevision: data.managementRevision,
        termsRevision: data.termsRevision,
        lifecycle: mapLifecycle(data.lifecycle),
    };
}

export function mapToShippingProfile(data: ShippingProfileData): ShippingProfile {
    const terms = mapToAdvertisedDeliveryTerms(data.content.terms);
    return {
        shippingProfileId: data.shippingProfileId,
        listingSourceId: data.listingSourceId,
        name: data.content.name,
        managementRevision: data.managementRevision,
        termsRevision: data.termsRevision,
        lifecycle: mapLifecycle(data.lifecycle),
        attributedPartyId: data.content.attributedPartyId ?? null,
        ...(terms ? { terms } : {}),
        hasUnsupportedValues: terms === undefined,
    };
}

/** One keyset page in ascending ID order; an empty page is the last. */
export type ShippingProfilePage = {
    readonly items: readonly ShippingProfileSummary[];
    /** Send as `after` for the next page; absent after an empty page. */
    readonly next?: string;
};

export function mapToShippingProfilePage(
    data: readonly ShippingProfileSummaryData[],
): ShippingProfilePage {
    const items = data.map(mapToShippingProfileSummary);
    const last = items.at(-1);
    return last ? { items, next: last.shippingProfileId } : { items };
}

export type ShippingDefaultEligibility = "ACTIVE" | "RETIRED" | "MISSING" | "UNKNOWN";

/**
 * The source's explicit default. Revision 1 means never assigned. A retired or missing selection
 * stays visible and selects no fallback.
 */
export type ShippingDefault = {
    readonly listingSourceId: string;
    readonly revision: number;
    readonly shippingProfileId?: string;
    readonly eligibility?: ShippingDefaultEligibility;
};

export function mapToShippingDefault(data: ShippingDefaultData): ShippingDefault {
    const eligibility =
        data.eligibility == null
            ? undefined
            : data.eligibility === "ACTIVE" ||
                data.eligibility === "RETIRED" ||
                data.eligibility === "MISSING"
              ? data.eligibility
              : "UNKNOWN";
    return {
        listingSourceId: data.listingSourceId,
        revision: data.revision,
        ...(data.shippingProfileId != null ? { shippingProfileId: data.shippingProfileId } : {}),
        ...(eligibility ? { eligibility } : {}),
    };
}

/** Protected provenance link; never fetched, never shown back, no buyer addresses. */
export type ShippingEvidenceInput = {
    readonly reference: string;
    readonly assertion: string;
};

export type ShippingProfileContentInput = {
    readonly name: string;
    /** `null` attributes the profile to no Party; attribution grants no seller or carrier role. */
    readonly attributedPartyId: string | null;
    readonly terms: AdvertisedDeliveryTerms;
};

function toBackendContent(content: ShippingProfileContentInput) {
    return {
        name: content.name,
        attributedPartyId: content.attributedPartyId,
        terms: mapToBackendAdvertisedDeliveryTerms(content.terms),
    };
}

/**
 * `creationKey` identifies one deliberate create per source and caller: an exact retry returns
 * the existing profile, different content under the same key conflicts. Keep the key for retries
 * of the same draft and mint a new one for a new draft.
 */
export function mapToBackendCreateShippingProfile(input: {
    readonly creationKey: string;
    readonly content: ShippingProfileContentInput;
    readonly evidence: readonly ShippingEvidenceInput[];
}): CreateShippingProfileData {
    return {
        creationKey: input.creationKey,
        content: toBackendContent(input.content),
        evidence: input.evidence.map((entry) => ({ ...entry })),
    };
}

/** A complete replacement; `[]` evidence corrects the current set (history keeps the old). */
export function mapToBackendReplaceShippingProfile(input: {
    readonly expectedRevision: number;
    readonly content: ShippingProfileContentInput;
    readonly evidence: readonly ShippingEvidenceInput[];
}): ReplaceShippingProfileData {
    return {
        expectedRevision: input.expectedRevision,
        content: toBackendContent(input.content),
        evidence: input.evidence.map((entry) => ({ ...entry })),
    };
}

/** Retire and restore: the body carries only the management revision. */
export function mapToBackendShippingProfileLifecycle(
    expectedRevision: number,
): ShippingProfileLifecycleData {
    return { expectedRevision };
}

export function mapToBackendAssignShippingDefault(input: {
    readonly expectedRevision: number;
    readonly shippingProfileId: string;
}): AssignShippingDefaultData {
    return { expectedRevision: input.expectedRevision, shippingProfileId: input.shippingProfileId };
}

export function mapToBackendClearShippingDefault(
    expectedRevision: number,
): ClearShippingDefaultData {
    return { expectedRevision };
}
