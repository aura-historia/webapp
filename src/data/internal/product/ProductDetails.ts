import {
    mapPersonalizedGetProductDataToOverviewProduct,
    type OverviewProduct,
} from "@/data/internal/product/OverviewProduct.ts";

export type ProductDetail = OverviewProduct;

/**
 * Keeps the existing product detail adapter focused on the listing itself.
 * ProductListing history is fetched and mapped through ProductListingHistory.ts.
 */
export function mapToDetailProduct(
    apiData: Parameters<typeof mapPersonalizedGetProductDataToOverviewProduct>[0],
    locale: string,
): ProductDetail {
    return mapPersonalizedGetProductDataToOverviewProduct(apiData, locale);
}
