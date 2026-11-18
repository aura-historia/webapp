import type { ProductListingDetail } from "@/data/internal/product/ProductListingDetail.ts";
import type { PublicListingSource } from "@/data/internal/shop/PublicListingSource.ts";

/** A listing a notice can be about, read from the listing page's public data. */
export type ContentNoticeListingTarget = {
    readonly kind: "listing";
    readonly productListingId: string;
    readonly productListingTitleSlugId: string;
    readonly title?: string;
    readonly listingSourceId: string;
    readonly providerName: string;
    readonly providerSlugId: string;
    readonly partner: boolean;
};

/** A provider a notice can be about, with all of its listings. */
export type ContentNoticeProviderTarget = {
    readonly kind: "provider";
    readonly listingSourceId: string;
    readonly providerName: string;
    readonly providerSlugId: string;
    readonly partner: boolean;
};

export type ContentNoticeTarget = ContentNoticeListingTarget | ContentNoticeProviderTarget;

export type ContentNoticeTargetKind = ContentNoticeTarget["kind"];

/** What the route loader hands the page: a target, a target that is gone, or none in the link. */
export type ContentNoticeLoaderData =
    | { readonly status: "ready"; readonly target: ContentNoticeTarget }
    | { readonly status: "notFound"; readonly kind: ContentNoticeTargetKind }
    | { readonly status: "missing" };

/** Which part the notice covers: the listing alone, or every listing of its provider. */
export type ContentNoticeScope = "listing" | "provider";

export function mapListingTarget(
    listing: ProductListingDetail,
    productListingTitleSlugId: string,
): ContentNoticeListingTarget {
    return {
        kind: "listing",
        productListingId: listing.productListingId,
        productListingTitleSlugId: listing.productListingTitleSlugId ?? productListingTitleSlugId,
        title: listing.title,
        listingSourceId: listing.source.listingSourceId,
        providerName: listing.source.name,
        providerSlugId: listing.source.slugId,
        partner: listing.source.partner,
    };
}

export function mapProviderTarget(source: PublicListingSource): ContentNoticeProviderTarget {
    return {
        kind: "provider",
        listingSourceId: source.listingSourceId,
        providerName: source.name,
        providerSlugId: source.slugId,
        partner: source.partner,
    };
}

/** The part a notice covers: a provider target always covers the whole provider. */
export function effectiveScope(
    target: ContentNoticeTarget,
    scope: ContentNoticeScope,
): ContentNoticeScope {
    return target.kind === "provider" ? "provider" : scope;
}
