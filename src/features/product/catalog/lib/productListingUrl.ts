export function getProductListingPath(productListingTitleSlugId: string): string {
    return `/products/${encodeURIComponent(productListingTitleSlugId)}`;
}
