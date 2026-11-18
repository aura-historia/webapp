import type { GeographicAssertions } from "@/data/internal/geography/GeographicAssertions.ts";
import type { UserAddressResolutionStatus } from "@/data/internal/geography/UserAddress.ts";
import { formatCountryName } from "@/features/geography/lib/formatGeography.ts";

/**
 * How an address's location is shown (board "Account · Saved addresses — states"). The backend
 * still locates every address after saving, but the page shows no background status: a located
 * address shows its values, a pending lookup shows nothing until it finishes, and every other
 * outcome is "Not located" with the way to fix it, picking a suggestion. Never "verified",
 * "valid" or "deliverable".
 */
export type LocationDisplay = "located" | "pending" | "notLocated";

export function locationDisplay(status: UserAddressResolutionStatus): LocationDisplay {
    if (status === "ACCEPTED") return "located";
    if (status === "PENDING") return "pending";
    return "notLocated";
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
