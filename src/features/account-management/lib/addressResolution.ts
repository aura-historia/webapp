import type { GeographicAssertions } from "@/data/internal/geography/GeographicAssertions.ts";
import type { UserAddressResolutionStatus } from "@/data/internal/geography/UserAddress.ts";
import { formatCountryName } from "@/features/geography/lib/formatGeography.ts";

export type ResolutionMark = "found" | "locating" | "hollow" | "dashed";

/**
 * How each resolution status is shown (board "Account · Saved addresses — states"). Statuses
 * describe browsing enrichment only: never "verified", "valid" or "deliverable".
 */
export const RESOLUTION_MARKS: Record<UserAddressResolutionStatus, ResolutionMark> = {
    ACCEPTED: "found",
    PENDING: "locating",
    AMBIGUOUS: "hollow",
    NO_MATCH: "hollow",
    FAILED: "dashed",
    BLOCKED: "dashed",
    UNAVAILABLE: "dashed",
    UNKNOWN: "dashed",
};

export const RESOLUTION_MARK_CLASS: Record<ResolutionMark, string> = {
    found: "bg-ink",
    locating: "shadow-[inset_0_0_0_2px_var(--brass)]",
    hollow: "shadow-[inset_0_0_0_1.5px_var(--ink-muted)]",
    dashed: "border-[1.5px] border-dashed border-ink-muted",
};

/** Row hints exist for statuses the user can act on or should not worry about. */
export const RESOLUTION_HAS_HINT: Record<UserAddressResolutionStatus, boolean> = {
    ACCEPTED: false,
    PENDING: true,
    AMBIGUOUS: true,
    NO_MATCH: true,
    FAILED: true,
    BLOCKED: true,
    UNAVAILABLE: true,
    UNKNOWN: false,
};

/**
 * Translation keys of the row hint and the editor note. Advice to add a country or postal code
 * would be wrong once the user gave one, so those statuses then ask for more address detail.
 */
export function resolutionCopyKeys(
    status: UserAddressResolutionStatus,
    geography: GeographicAssertions,
): { readonly hint?: string; readonly note: string } {
    const detailed =
        (status === "AMBIGUOUS" || status === "NO_MATCH") &&
        Boolean(geography.country || geography.postalCode);
    const hintVariant = detailed ? "hintDetailed" : "hint";
    const noteVariant = detailed ? "noteDetailed" : "note";
    return {
        ...(RESOLUTION_HAS_HINT[status] && {
            hint: `account.addresses.status.${status}.${hintVariant}`,
        }),
        note: `account.addresses.status.${status}.${noteVariant}`,
    };
}

/** "Germany · DE-BE · 10119": country name, subdivision code and postal code, as available. */
export function formatGeographyFacts(
    geography: GeographicAssertions | undefined,
    language: string,
): string {
    if (!geography) return "";
    return [
        geography.country && formatCountryName(geography.country, language),
        geography.subdivision,
        geography.postalCode,
    ]
        .filter(Boolean)
        .join(" · ");
}
