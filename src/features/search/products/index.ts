/**
 * Public product-search controls used by other feature slices.
 *
 * Keep saved-search workflows dependent on this boundary rather than on the
 * product-search implementation files. The exports can remain stable when
 * product-search internals move into its own slice.
 */
export type { FilterSchema } from "@/features/search/common/lib/filterForm.ts";
export { SearchFilterFormProvider } from "@/features/search/common/components/SearchFilterFormProvider.tsx";
export { ShopTypeFilter } from "@/features/search/common/components/filters/ShopTypeFilter.tsx";
export { AuctionDateSpanFilter } from "@/features/search/products/components/filters/AuctionDateSpanFilter.tsx";
export { CreationDateSpanFilter } from "@/features/search/products/components/filters/CreationDateSpanFilter.tsx";
export { MerchantFilters } from "@/features/search/products/components/filters/MerchantFilters.tsx";
export { PriceSpanFilter } from "@/features/search/products/components/filters/PriceSpanFilter.tsx";
export { ProductStateFilter } from "@/features/search/products/components/filters/ProductStateFilter.tsx";
export { UpdateDateSpanFilter } from "@/features/search/products/components/filters/UpdateDateSpanFilter.tsx";
