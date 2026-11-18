import type { QueryClient } from "@tanstack/react-query";
import { getProductListingByTitleSlug } from "@/client";
import { getPublicListingSourceBySlugOptions } from "@/client/@tanstack/react-query.gen";
import { mapToBackendLanguage, parseLanguage } from "@/data/internal/common/Language.ts";
import { mapToProductListingDetail } from "@/data/internal/product/ProductListingDetail.ts";
import { mapPublicListingSource } from "@/data/internal/shop/PublicListingSource.ts";
import type { ContentNoticeSearch } from "@/features/content-notice/lib/contentNoticeSearch.ts";
import {
    type ContentNoticeLoaderData,
    mapListingTarget,
    mapProviderTarget,
} from "@/features/content-notice/lib/contentNoticeTarget.ts";
import { isApiNotFoundError } from "@/lib/api/apiError.ts";

/**
 * Reads the listing or provider a notice is about from its public slug. Its own query key: the
 * form needs only public names and IDs, in the page language, without personalization.
 */
export async function loadContentNoticeTarget(
    queryClient: QueryClient,
    search: ContentNoticeSearch,
    lng: string,
): Promise<ContentNoticeLoaderData> {
    try {
        if (search.listing) {
            const slug = search.listing;
            const language = mapToBackendLanguage(parseLanguage(lng)) ?? "en";
            const data = await queryClient.ensureQueryData({
                queryKey: ["contentNotice", "listing", slug, language],
                queryFn: async ({ signal }) => {
                    const response = await getProductListingByTitleSlug({
                        path: { productListingTitleSlugId: slug },
                        query: { language },
                        signal,
                        throwOnError: true,
                    });
                    return response.data;
                },
            });
            const listing = mapToProductListingDetail(data, lng);
            // A withdrawn listing can no longer be reported: the backend answers 404 for it.
            if (listing.lifecycle === "WITHDRAWN") return { status: "notFound", kind: "listing" };
            return { status: "ready", target: mapListingTarget(listing, slug) };
        }
        if (search.provider) {
            const data = await queryClient.ensureQueryData(
                getPublicListingSourceBySlugOptions({
                    path: { listingSourceSlugId: search.provider },
                }),
            );
            return { status: "ready", target: mapProviderTarget(mapPublicListingSource(data)) };
        }
        return { status: "missing" };
    } catch (error) {
        if (isApiNotFoundError(error)) {
            return { status: "notFound", kind: search.listing ? "listing" : "provider" };
        }
        throw error;
    }
}
