import { validatePartnerCreateSearch } from "@/features/partner/common/lib/partnerCreateSearch.ts";

/**
 * `?create=true` opens the new application dialog; `&provider=<slug>` also chooses that listed
 * provider in it, e.g. from the "Apply as a partner" link on a provider page.
 */
export type PartnerApplicationsSearch = {
    readonly create?: true;
    readonly provider?: string;
};

/** A listing-source slug: letters, digits and hyphens, as public provider URLs carry it. */
const PROVIDER_SLUG_PATTERN = /^[A-Za-z0-9][A-Za-z0-9-]{0,199}$/;

export function validatePartnerApplicationsSearch(
    search: Record<string, unknown>,
): PartnerApplicationsSearch {
    const { create } = validatePartnerCreateSearch(search);
    if (!create) return {};
    const provider = typeof search.provider === "string" ? search.provider.trim() : "";
    return PROVIDER_SLUG_PATTERN.test(provider) ? { create, provider } : { create };
}
