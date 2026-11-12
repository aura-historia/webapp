import { useQuery } from "@tanstack/react-query";
import { getPublicListingSourceBySlug } from "@/client";
import {
    type ApplicationListingSource,
    mapToApplicationListingSource,
} from "@/data/internal/partner-application/OwnPartnershipApplication.ts";

/**
 * The listed provider behind a public slug, to choose it in the new application dialog. Resolves
 * to `null` when the slug names no provider, so the dialog simply starts with an empty search.
 */
export function useApplicationListingSourceBySlug(slug: string | undefined) {
    return useQuery({
        queryKey: ["public-listing-source-selection", "by-slug", slug],
        enabled: Boolean(slug),
        staleTime: 30_000,
        retry: false,
        queryFn: async (): Promise<ApplicationListingSource | null> => {
            const response = await getPublicListingSourceBySlug({
                path: { listingSourceSlugId: slug ?? "" },
            });
            return response.data ? mapToApplicationListingSource(response.data) : null;
        },
    });
}
