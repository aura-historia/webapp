import type { TFunction } from "i18next";
import type { PartyLocation } from "@/data/internal/geography/PartyLocation.ts";
import { formatCountryName } from "@/features/geography/lib/formatGeography.ts";

/** Compact region line for lists: country name, subdivision code and postal code, if asserted. */
export function formatPartyLocationRegion(
    location: PartyLocation,
    language: string,
    t: TFunction,
): string {
    const geography = location.geography;
    const parts = [
        geography?.country && formatCountryName(geography.country, language),
        geography?.subdivision,
        geography?.postalCode,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(" · ") : t("partyLocations.fields.noGeography");
}
